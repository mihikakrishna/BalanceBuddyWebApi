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
    useTheme,
    useMediaQuery,
    Snackbar,
    Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchExpenseCategories, deleteExpenseCategory } from "../api/expenseCategory";
import { fetchIncomeCategories, deleteIncomeCategory } from "../api/incomeCategory";
import ExpenseCategoryForm from "../features/expenseCategories/expenseCategoryForm";
import IncomeCategoryForm from "../features/incomeCategories/incomeCategoryForm";

const SettingsPage = ({ mode, toggleMode }) => {
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [showExpenseCategories, setShowExpenseCategories] = useState(false);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [showIncomeCategories, setShowIncomeCategories] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const darkModeRef = useRef(null);
    const expenseFormRef = useRef(null);
    const expenseListRef = useRef(null);
    const incomeFormRef = useRef(null);
    const incomeListRef = useRef(null);

    const scrollTo = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const loadExpenseCategories = async () => {
        try {
            const data = await fetchExpenseCategories();
            setExpenseCategories(data);
        } catch (err) {
            console.error("Failed to load expense categories:", err);
        }
    };

    const loadIncomeCategories = async () => {
        try {
            const data = await fetchIncomeCategories();
            setIncomeCategories(data);
        } catch (err) {
            console.error("Failed to load income categories:", err);
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await deleteExpenseCategory(id);
            await loadExpenseCategories();
        } catch (err) {
            console.error("Failed to delete expense category:", err);
            setSnackbarMessage("Could not delete category. Check if it is in use or try again.");
            setSnackbarOpen(true);
        }
    };

    const handleDeleteIncome = async (id) => {
        try {
            await deleteIncomeCategory(id);
            await loadIncomeCategories();
        } catch (err) {
            console.error("Failed to delete income category:", err);
            setSnackbarMessage("Could not delete category. Check if it is in use or try again.");
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        loadExpenseCategories();
        loadIncomeCategories();
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mt: 4,
                px: 2,
            }}
        >
            {/* Sidebar */}
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    width: { xs: "100%", sm: "220px" },
                    flexShrink: 0,
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Settings
                </Typography>
                <List dense>
                    <ListItem button onClick={() => scrollTo(darkModeRef)}>
                        <ListItemText primary="Toggle Dark Mode" />
                    </ListItem>
                    <ListItem button onClick={() => scrollTo(expenseFormRef)}>
                        <ListItemText primary="Add Expense Category" />
                    </ListItem>
                    <ListItem button onClick={() => scrollTo(expenseListRef)}>
                        <ListItemText primary="View Expense Categories" />
                    </ListItem>
                    <ListItem button onClick={() => scrollTo(incomeFormRef)}>
                        <ListItemText primary="Add Income Category" />
                    </ListItem>
                    <ListItem button onClick={() => scrollTo(incomeListRef)}>
                        <ListItemText primary="View Income Categories" />
                    </ListItem>
                </List>
            </Paper>

            {/* Main Content */}
            <Paper
                elevation={3}
                sx={{
                    flexGrow: 1,
                    p: 3,
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <Box ref={darkModeRef}>
                    <Typography variant="h5" gutterBottom>
                        General Settings
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mode === "dark"}
                                onChange={toggleMode}
                                color="primary"
                            />
                        }
                        label="Dark Mode"
                    />
                </Box>

                {/* Add Expense Category */}
                <Box ref={expenseFormRef} sx={{ mt: 4 }}>
                    <Typography variant="h5">Expense Categories</Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Add New Category
                    </Typography>
                    <ExpenseCategoryForm onSuccess={loadExpenseCategories} />
                </Box>

                {/* Expense Category List */}
                <Box ref={expenseListRef} sx={{ mt: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Existing Expense Categories</Typography>
                        <IconButton onClick={() => setShowExpenseCategories((prev) => !prev)}>
                            {showExpenseCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Collapse in={showExpenseCategories}>
                        <List dense>
                            {expenseCategories.map((cat) => (
                                <ListItem
                                    key={cat.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleDeleteExpense(cat.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={cat.name}
                                        secondary={
                                            cat.budget != null
                                                ? `Budget: $${parseFloat(cat.budget).toFixed(2)}`
                                                : undefined
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </Box>

                {/* Add Income Category */}
                <Box ref={incomeFormRef} sx={{ mt: 6 }}>
                    <Typography variant="h5">Income Categories</Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Add New Category
                    </Typography>
                    <IncomeCategoryForm onSuccess={loadIncomeCategories} />
                </Box>

                {/* Income Category List */}
                <Box ref={incomeListRef} sx={{ mt: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Existing Income Categories</Typography>
                        <IconButton onClick={() => setShowIncomeCategories((prev) => !prev)}>
                            {showIncomeCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Collapse in={showIncomeCategories}>
                        <List dense>
                            {incomeCategories.map((cat) => (
                                <ListItem
                                    key={cat.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleDeleteIncome(cat.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={cat.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </Box>
            </Paper>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="warning" onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SettingsPage;
