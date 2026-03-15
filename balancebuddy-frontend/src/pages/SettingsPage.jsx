import React, { useEffect, useState } from "react";
import {
    Typography,
    Paper,
    Box,
    Switch,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Alert,
} from "@mui/material";
import ExpenseCategoryForm from "../features/expenseCategories/expenseCategoryForm";
import IncomeCategoryForm from "../features/incomeCategories/incomeCategoryForm";
import {
    fetchExpenseCategories,
} from "../api/expenseCategory";
import {
    fetchIncomeCategories,
} from "../api/incomeCategory";

const SettingsPage = ({ mode, toggleMode }) => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const loadCategories = async () => {
        try {
            await Promise.all([
                fetchExpenseCategories(),
                fetchIncomeCategories(),
            ]);
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Failed to load categories.",
                severity: "error",
            });
        }
    };

    const handleShowSnackbar = (message, severity = "info") => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                p: 2,
            }}
        >
            {/* Sidebar */}
            <Paper sx={{ p: 2, width: { xs: "100%", sm: 220 } }}>
                <Typography variant="h6" gutterBottom>
                    Settings
                </Typography>
                <List dense>
                    {["Toggle Dark Mode", "Expense Categories", "Income Categories"].map(
                        (label) => (
                            <ListItem key={label}>
                                <ListItemText primary={label} />
                            </ListItem>
                        )
                    )}
                </List>
            </Paper>

            {/* Main Panel */}
            <Paper sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    General Settings
                </Typography>
                <FormControlLabel
                    control={<Switch checked={mode === "dark"} onChange={toggleMode} />}
                    label="Dark Mode"
                />
                <Divider sx={{ my: 3 }} />

                {/* Expense Categories */}
                <Typography variant="h5">Expense Categories</Typography>
                <ExpenseCategoryForm
                    onSuccess={loadCategories}
                    onShowSnackbar={handleShowSnackbar}
                />

                {/* Income Categories */}
                <Typography variant="h5" mt={5}>
                    Income Categories
                </Typography>
                <IncomeCategoryForm
                    onSuccess={loadCategories}
                    onShowSnackbar={handleShowSnackbar}
                />
            </Paper>

            {/* Central Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SettingsPage;
