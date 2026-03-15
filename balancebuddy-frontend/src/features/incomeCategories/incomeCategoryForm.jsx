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

const IncomeCategoryForm = ({ onSuccess, onShowSnackbar }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: "" });
    const [openForm, setOpenForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const loadCategories = useCallback(async () => {
        try {
            const data = await fetchIncomeCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
            onShowSnackbar("Failed to load income categories.", "error");
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
        const payload = { name: formData.name.trim() };
        try {
            await createIncomeCategory(payload);
            onShowSnackbar("Category created.", "success");
            setFormData({ name: "" });
            setOpenForm(false);
            loadCategories();
            onSuccess?.();
        } catch (err) {
            console.error(err);
            onShowSnackbar(err.message || "Failed to create category.", "error");
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
            onShowSnackbar("Category updated.", "success");
            setEditingId(null);
            setEditingName("");
            loadCategories();
            onSuccess?.();
        } catch (err) {
            console.error(err);
            onShowSnackbar(err.message || "Failed to update category.", "error");
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm(`Delete category "${category.name}"?`)) return;
        try {
            await deleteIncomeCategory(category.id);
            onShowSnackbar("Category deleted.", "success");
            loadCategories();
            onSuccess?.();
        } catch (err) {
            console.error(err);
            onShowSnackbar(err.message || "Failed to delete category.", "error");
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
        </Box>
    );
};

export default IncomeCategoryForm;
