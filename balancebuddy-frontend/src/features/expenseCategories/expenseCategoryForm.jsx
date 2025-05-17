import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    Divider,
    Collapse,
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";
import { createExpenseCategory, updateExpenseCategory } from "../../api/expenseCategory";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const ExpenseCategoryForm = ({ onSuccess, editingCategory }) => {
    const [formData, setFormData] = useState({ name: "", budget: "" });
    const [open, setOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Pre-fill when editing
    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name || "",
                budget: editingCategory.budget != null ? editingCategory.budget.toString() : "",
            });
            setOpen(true);
        } else {
            setFormData({ name: "", budget: "" });
        }
    }, [editingCategory]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            id: editingCategory?.id,
            name: formData.name,
            budget: formData.budget.trim() === "" ? null : parseFloat(formData.budget),
        };

        try {
            if (editingCategory) {
                await updateExpenseCategory(editingCategory.id, payload);
                setSnackbar({ open: true, message: "Category updated", severity: "success" });
            } else {
                await createExpenseCategory(payload);
                setSnackbar({ open: true, message: "Category created", severity: "success" });
            }
            setFormData({ name: "", budget: "" });
            onSuccess();
            setOpen(false);
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Category name might already exist. Try another.",
                severity: "error",
            });
        }
    };

    return (
        <Paper
            elevation={3}
            sx={(theme) => ({
                p: 2,
                borderRadius: 2,
                backgroundColor:
                    theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.7)",
                backdropFilter: "blur(10px)",
                mt: 3,
            })}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                    {editingCategory ? "Edit Expense Category" : "Add New Expense Category"}
                </Typography>
                <IconButton onClick={() => setOpen(!open)}>
                    {open ? <RemoveIcon /> : <AddIcon />}
                </IconButton>
            </Box>
            <Collapse in={open}>
                <Divider sx={{ my: 2 }} />
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <TextField
                        label="Category Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Budget (optional)"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleChange}
                    />
                    <Button variant="contained" color="primary" type="submit">
                        {editingCategory ? "Update Category" : "Add Category"}
                    </Button>
                </Box>
            </Collapse>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ExpenseCategoryForm;
