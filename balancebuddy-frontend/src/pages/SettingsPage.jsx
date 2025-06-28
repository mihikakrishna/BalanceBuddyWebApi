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
    IconButton,
    Snackbar,
    Alert,
    Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpenseCategoryForm from "../features/expenseCategories/expenseCategoryForm";
import IncomeCategoryForm from "../features/incomeCategories/incomeCategoryForm";
import {
    fetchExpenseCategories,
    deleteExpenseCategory,
} from "../api/expenseCategory";
import {
    fetchIncomeCategories,
    deleteIncomeCategory,
} from "../api/incomeCategory";

const SettingsPage = ({ mode, toggleMode }) => {
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [editingExpenseCategory, setEditingExpenseCategory] = useState(null);
    const [editingIncomeCategory, setEditingIncomeCategory] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const loadCategories = async () => {
        try {
            const [exp, inc] = await Promise.all([
                fetchExpenseCategories(),
                fetchIncomeCategories(),
            ]);
            setExpenseCategories(exp);
            setIncomeCategories(inc);
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

    const handleDelete = async (id, isExpense = true) => {
        try {
            if (isExpense) {
                await deleteExpenseCategory(id);
            } else {
                await deleteIncomeCategory(id);
            }
            await loadCategories();
            handleShowSnackbar("Category deleted.", "success");
        } catch (err) {
            console.error(err);
            handleShowSnackbar(
                err.message ||
                "Could not delete category. Check if it is in use or try again.",
                "warning"
            );
        }
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
                    editingCategory={editingExpenseCategory}
                    onShowSnackbar={handleShowSnackbar}
                />

                {/* Income Categories */}
                <Typography variant="h5" mt={5}>
                    Income Categories
                </Typography>
                <IncomeCategoryForm
                    onSuccess={loadCategories}
                    editingCategory={editingIncomeCategory}
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
