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
    Button,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchCategories, deleteExpenseCategory } from "../api/expenseCategory";
import ExpenseCategoryForm from "../features/expenseCategories/expenseCategoryForm";

const SettingsPage = ({ mode, toggleMode }) => {
    const [categories, setCategories] = useState([]);
    const [showCategories, setShowCategories] = useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const darkModeRef = useRef(null);
    const addCategoryRef = useRef(null);
    const listRef = useRef(null);

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteExpenseCategory(id);
            await loadCategories();
        } catch (err) {
            console.error("Failed to delete category:", err);
        }
    };

    const scrollTo = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
                mt: 4,
                px: 2,
            }}
        >
            {/* Sidebar */}
            <Paper
                elevation={3}
                sx={(theme) => ({
                    p: 2,
                    width: { xs: "100%", sm: "220px" },
                    flexShrink: 0,
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(10px)",
                })}
            >
                <Typography variant="h6" gutterBottom>
                    Settings
                </Typography>
                <List dense>
                    <ListItem button onClick={() => scrollTo(darkModeRef)}>
                        <ListItemText primary="Toggle Dark Mode" />
                    </ListItem>
                    <ListItem button onClick={() => scrollTo(addCategoryRef)}>
                        <ListItemText primary="Add Expense Category" />
                    </ListItem>
                    <ListItem button onClick={() => scrollTo(listRef)}>
                        <ListItemText primary="View Expense Categories" />
                    </ListItem>
                </List>
            </Paper>

            {/* Main Content */}
            <Paper
                elevation={3}
                sx={(theme) => ({
                    flexGrow: 1,
                    p: 3,
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(10px)",
                })}
            >
                {/* Dark Mode Toggle */}
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

                {/* Add Category Form */}
                <Box ref={addCategoryRef} sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Expense Categories
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Add New Category
                    </Typography>
                    <ExpenseCategoryForm onSuccess={loadCategories} />
                </Box>

                {/* Collapsible Category List */}
                <Box ref={listRef} sx={{ mt: 4 }}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h6">
                            Existing Categories
                        </Typography>
                        <IconButton onClick={() => setShowCategories((prev) => !prev)}>
                            {showCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Collapse in={showCategories}>
                        <List dense>
                            {categories.map((cat) => (
                                <ListItem
                                    key={cat.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleDelete(cat.id)}
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
            </Paper>
        </Box>
    );
};

export default SettingsPage;
