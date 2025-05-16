import React, { useState, useMemo } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
} from "react-router-dom";
import {
    ThemeProvider,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Container,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";
import ImportStatementsPage from "./pages/ImportStatementsPage";
import SettingsPage from "./pages/SettingsPage";
import DatabasePage from "./pages/DatabasePage";
import Dashboard from "./pages/Dashboard";
import { getTheme } from "./theme";

function App() {
    const [mode, setMode] = useState("light");
    const theme = useMemo(() => getTheme(mode), [mode]);

    const toggleMode = () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "100vh",
                        width: "100%",
                    }}
                >
                    <AppBar position="static" color="primary">
                        <Toolbar>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                BalanceBuddy Web
                            </Typography>
                            <Button color="inherit" component={Link} to="/database">
                                Database
                            </Button>
                            <Button color="inherit" component={Link} to="/dashboard">
                                Dashboard
                            </Button>
                            <Button color="inherit" component={Link} to="/expenses">
                                Expenses
                            </Button>
                            <Button color="inherit" component={Link} to="/incomes">
                                Incomes
                            </Button>
                            <Button color="inherit" component={Link} to="/import">
                                Import Statements
                            </Button>
                            <Button color="inherit" component={Link} to="/settings">
                                Settings
                            </Button>
                            <IconButton sx={{ ml: 2 }} onClick={toggleMode} color="inherit">
                                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                        </Toolbar>
                    </AppBar>

                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            width: "100%",
                            maxWidth: "100vw",
                            backgroundColor: theme.palette.background.default,
                            backdropFilter: "blur(10px)",
                            p: 2,
                        }}
                    >
                        <Container maxWidth="lg">
                            <Routes>
                                <Route path="/database" element={<DatabasePage />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/expenses" element={<ExpensesPage />} />
                                <Route path="/incomes" element={<IncomesPage />} />
                                <Route path="/import" element={<ImportStatementsPage />} />
                                <Route
                                    path="/settings"
                                    element={<SettingsPage mode={mode} toggleMode={toggleMode} />}
                                />
                                <Route path="*" element={<p>404 - Not Found</p>} />
                            </Routes>
                        </Container>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;
