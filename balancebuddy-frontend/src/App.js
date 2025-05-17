import React, { useState, useMemo } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useLocation,
} from "react-router-dom";
import {
    ThemeProvider,
    CssBaseline,
    Box,
    IconButton,
    Typography,
} from "@mui/material";
import {
    Brightness4,
    Brightness7,
    Dashboard as DashboardIcon,
    AccountBalanceWallet,
    AttachMoney,
    FileUpload,
    Storage,
    Settings as SettingsIcon,
} from "@mui/icons-material";

import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";
import ImportStatementsPage from "./pages/ImportStatementsPage";
import SettingsPage from "./pages/SettingsPage";
import DatabasePage from "./pages/DatabasePage";
import Dashboard from "./pages/Dashboard";
import { getTheme } from "./theme";

const drawerWidth = 220;

const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Expenses", icon: <AccountBalanceWallet />, path: "/expenses" },
    { text: "Incomes", icon: <AttachMoney />, path: "/incomes" },
    { text: "Import", icon: <FileUpload />, path: "/import" },
    { text: "Database", icon: <Storage />, path: "/database" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const Sidebar = ({ mode }) => {
    const location = useLocation();

    const lightGreen = "#A6CE8A";
    const darkGreen = "#85B86E";
    const textColor = "#2F4F2F";
    const activeText = "#FFFFFF";

    return (
        <Box
            sx={{
                width: drawerWidth,
                minHeight: "100vh",
                bgcolor: lightGreen,
                color: textColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: 4,
                borderRight: "1px solid rgba(0,0,0,0.1)",
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 4 }}>
                BalanceBuddy
            </Typography>

            {navItems.map(({ text, icon, path }) => {
                const isActive = location.pathname === path;
                return (
                    <Box
                        key={text}
                        component={Link}
                        to={path}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            py: 2,
                            mb: 1,
                            textDecoration: "none",
                            color: isActive ? activeText : textColor,
                            backgroundColor: isActive ? darkGreen : "transparent",
                            fontWeight: isActive ? 600 : 500,
                            "&:hover": {
                                backgroundColor: isActive ? darkGreen : "#99C77C",
                            },
                            borderTopLeftRadius: 30,
                            borderBottomLeftRadius: 30,
                            transition: "0.2s",
                        }}
                    >
                        <Box sx={{ fontSize: 22, mb: 0.5 }}>{icon}</Box>
                        <Typography variant="caption">{text}</Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

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
                        minHeight: "100vh",
                        overflow: "hidden",
                    }}
                >
                    <Sidebar mode={mode} />

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            bgcolor: theme.palette.background.default,
                            minHeight: "100vh",
                            overflowY: "auto",
                            overflowX: "hidden",
                        }}
                    >
                        {/* Top-right toggle bar */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                px: 3,
                                py: 0,
                                mt: 2,
                            }}
                        >
                            <IconButton onClick={toggleMode} color="inherit">
                                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                        </Box>

                        {/* Page content */}
                        <Box
                            sx={{
                                flexGrow: 1,
                                px: 3,
                                pt: 0,
                                pb: 3,
                            }}
                        >
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
                        </Box>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;
