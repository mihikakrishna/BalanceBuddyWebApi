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
import {
    createIncomeCategory,
    updateIncomeCategory,
} from "../../api/incomeCategory";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const IncomeCategoryForm = ({ onSuccess, editingCategory }) => {
    const [formData, setFormData] = useState({ name: "" });
    const [open, setOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name || "",
            });
            setOpen(true);
        } else {
            setFormData({ name: "" });
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
        };

        try {
            if (editingCategory) {
                await updateIncomeCategory(editingCategory.id, payload);
                setSnackbar({ open: true, message: "Category updated", severity: "success" });
            } else {
                await createIncomeCategory(payload);
                setSnackbar({ open: true, message: "Category created", severity: "success" });
            }
            setFormData({ name: "" });
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
                    {editingCategory ? "Edit Income Category" : "Add New Income Category"}
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

export default IncomeCategoryForm;
