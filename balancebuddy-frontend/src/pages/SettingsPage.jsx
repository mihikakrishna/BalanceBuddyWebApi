import React, { useEffect, useState, useRef } from "react";
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
    Collapse,
    Snackbar,
    Alert,
    useTheme,
    useMediaQuery,
    Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
    const [showExpenseCategories, setShowExpenseCategories] = useState(true);
    const [showIncomeCategories, setShowIncomeCategories] = useState(true);
    const [editingExpenseCategory, setEditingExpenseCategory] = useState(null);
    const [editingIncomeCategory, setEditingIncomeCategory] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    const theme = useTheme();

    const loadCategories = async () => {
        try {
            const [exp, inc] = await Promise.all([
                fetchExpenseCategories(),
                fetchIncomeCategories()
            ]);
            setExpenseCategories(exp);
            setIncomeCategories(inc);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id, isExpense = true) => {
        try {
            if (isExpense) {
                await deleteExpenseCategory(id);
                await loadCategories();
            } else {
                await deleteIncomeCategory(id);
                await loadCategories();
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: "Could not delete category. Check if it is in use or try again.",
                severity: "warning"
            });
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const renderCategoryList = (categories, isExpense = true) => (
        <List dense>
            {categories.map((cat) => (
                <ListItem
                    key={cat.id}
                    secondaryAction={
                        <Stack direction="row" spacing={1}>
                            <IconButton
                                color="primary"
                                onClick={() =>
                                    isExpense
                                        ? setEditingExpenseCategory(cat)
                                        : setEditingIncomeCategory(cat)
                                }
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                color="error"
                                onClick={() => handleDelete(cat.id, isExpense)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    }
                >
                    <ListItemText
                        primary={cat.name}
                        secondary={
                            isExpense && cat.budget != null
                                ? `Budget: $${parseFloat(cat.budget).toFixed(2)}`
                                : undefined
                        }
                    />
                </ListItem>
            ))}
        </List>
    );

    return (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, p: 2 }}>
            {/* Sidebar Navigation */}
            <Paper sx={{ p: 2, width: { xs: "100%", sm: 220 } }}>
                <Typography variant="h6" gutterBottom>Settings</Typography>
                <List dense>
                    {["Toggle Dark Mode", "Expense Categories", "Income Categories"].map(label => (
                        <ListItem key={label}>
                            <ListItemText primary={label} />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Main Settings Panel */}
            <Paper sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" gutterBottom>General Settings</Typography>
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
                />
                <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Existing Categories</Typography>
                        <IconButton onClick={() => setShowExpenseCategories(p => !p)}>
                            {showExpenseCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Collapse in={showExpenseCategories}>
                        {renderCategoryList(expenseCategories, true)}
                    </Collapse>
                </Box>

                {/* Income Categories */}
                <Typography variant="h5" mt={5}>Income Categories</Typography>
                <IncomeCategoryForm
                    onSuccess={loadCategories}
                    editingCategory={editingIncomeCategory}
                />
                <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Existing Categories</Typography>
                        <IconButton onClick={() => setShowIncomeCategories(p => !p)}>
                            {showIncomeCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Collapse in={showIncomeCategories}>
                        {renderCategoryList(incomeCategories, false)}
                    </Collapse>
                </Box>
            </Paper>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SettingsPage;
