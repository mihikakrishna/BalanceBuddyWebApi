import React, { useState, useEffect, useCallback } from "react";
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    IconButton,
    Collapse,
    Divider,
} from "@mui/material";
import {
    createExpenseCategory,
    updateExpenseCategory,
    fetchExpenseCategories,
    deleteExpenseCategory,
} from "../../api/expenseCategory";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

const ExpenseCategoryForm = ({ onSuccess, onShowSnackbar, editingCategory }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: "", budget: "" });
    const [openForm, setOpenForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingValues, setEditingValues] = useState({ name: "", budget: "" });

    const loadCategories = useCallback(async () => {
        try {
            const data = await fetchExpenseCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
            onShowSnackbar("Failed to load expense categories.", "error");
        }
    }, [onShowSnackbar]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name.trim(),
            budget: formData.budget.trim() === "" ? null : parseFloat(formData.budget),
        };
        try {
            await createExpenseCategory(payload);
            onShowSnackbar("Expense category created.", "success");
            setFormData({ name: "", budget: "" });
            setOpenForm(false);
            loadCategories();
            onSuccess?.();
        } catch (err) {
            console.error(err);
            onShowSnackbar(err.message || "Failed to create expense category.", "error");
        }
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditingValues({
            name: category.name,
            budget: category.budget != null ? category.budget.toString() : "",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValues({ name: "", budget: "" });
    };

    const saveEdit = async (category) => {
        try {
            await updateExpenseCategory(category.id, {
                id: category.id,
                name: editingValues.name.trim(),
                budget:
                    editingValues.budget.trim() === ""
                        ? null
                        : parseFloat(editingValues.budget),
            });
            onShowSnackbar("Expense category updated.", "success");
            setEditingId(null);
            setEditingValues({ name: "", budget: "" });
            loadCategories();
            onSuccess?.();
        } catch (err) {
            console.error(err);
            onShowSnackbar(err.message || "Failed to update expense category.", "error");
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm(`Delete category "${category.name}"?`)) return;
        try {
            await deleteExpenseCategory(category.id);
            onShowSnackbar("Expense category deleted.", "success");
            loadCategories();
            onSuccess?.();
        } catch (err) {
            console.error(err);
            onShowSnackbar(err.message || "Failed to delete expense category.", "error");
        }
    };

    return (
        <Box>
            {/* Add New Form */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Add New Expense Category</Typography>
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
                        <TextField
                            label="Budget (optional)"
                            name="budget"
                            type="number"
                            value={formData.budget}
                            onChange={handleFormChange}
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
                    Existing Expense Categories
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
                                <Box display="flex" flexDirection="column" flexGrow={1} gap={1}>
                                    <TextField
                                        size="small"
                                        value={editingValues.name}
                                        onChange={(e) =>
                                            setEditingValues({
                                                ...editingValues,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                    <TextField
                                        size="small"
                                        type="number"
                                        label="Budget"
                                        value={editingValues.budget}
                                        onChange={(e) =>
                                            setEditingValues({
                                                ...editingValues,
                                                budget: e.target.value,
                                            })
                                        }
                                    />
                                </Box>
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
                                <Box>
                                    <Typography>{category.name}</Typography>
                                    {category.budget != null && (
                                        <Typography variant="body2" color="textSecondary">
                                            Budget: ${category.budget}
                                        </Typography>
                                    )}
                                </Box>
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
        </Box>
    );
};

export default ExpenseCategoryForm;
