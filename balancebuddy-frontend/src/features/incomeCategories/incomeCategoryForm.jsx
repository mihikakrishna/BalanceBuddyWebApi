import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    IconButton,
    Snackbar,
    Alert,
    Collapse,
    Divider,
} from "@mui/material";
import {
    createIncomeCategory,
    updateIncomeCategory,
    fetchIncomeCategories,
    deleteIncomeCategory,
} from "../../api/incomeCategory";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

const IncomeCategoryForm = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: "" });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [openForm, setOpenForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const loadCategories = async () => {
        try {
            const data = await fetchIncomeCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: err.message || "Failed to load categories.",
                severity: "error",
            });
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const payload = { name: formData.name.trim() };
        try {
            await createIncomeCategory(payload);
            setSnackbar({ open: true, message: "Category created.", severity: "success" });
            setFormData({ name: "" });
            setOpenForm(false);
            loadCategories();
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: err.message || "Failed to create category.",
                severity: "error",
            });
        }
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEdit = async (category) => {
        try {
            await updateIncomeCategory(category.id, {
                id: category.id,
                name: editingName.trim(),
            });
            setSnackbar({ open: true, message: "Category updated.", severity: "success" });
            setEditingId(null);
            setEditingName("");
            loadCategories();
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: err.message || "Failed to update category.",
                severity: "error",
            });
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm(`Delete category "${category.name}"?`)) return;
        try {
            await deleteIncomeCategory(category.id);
            setSnackbar({ open: true, message: "Category deleted.", severity: "success" });
            loadCategories();
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: err.message || "Failed to delete category.",
                severity: "error",
            });
        }
    };

    return (
        <Box>
            {/* Add New Form */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Add New Income Category</Typography>
                    <IconButton onClick={() => setOpenForm(!openForm)}>
                        {openForm ? <RemoveIcon /> : <AddIcon />}
                    </IconButton>
                </Box>
                <Collapse in={openForm}>
                    <Divider sx={{ my: 2 }} />
                    <Box
                        component="form"
                        onSubmit={handleFormSubmit}
                        sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                    >
                        <TextField
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            required
                        />
                        <Button variant="contained" type="submit">
                            Add
                        </Button>
                    </Box>
                </Collapse>
            </Paper>

            {/* Category List */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Existing Income Categories
                </Typography>
                {categories.map((category) => (
                    <Box
                        key={category.id}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        p={1}
                        borderBottom="1px solid rgba(0,0,0,0.1)"
                    >
                        {editingId === category.id ? (
                            <>
                                <TextField
                                    size="small"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    sx={{ flexGrow: 1 }}
                                />
                                <Box>
                                    <IconButton onClick={() => saveEdit(category)}>
                                        <SaveIcon />
                                    </IconButton>
                                    <IconButton onClick={cancelEdit}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Typography>{category.name}</Typography>
                                <Box>
                                    {category.name !== "Unreviewed" && (
                                        <>
                                            <IconButton onClick={() => startEdit(category)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(category)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            </>
                        )}
                    </Box>
                ))}
            </Paper>

            {/* Snackbar floating at the bottom */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

export default IncomeCategoryForm;
