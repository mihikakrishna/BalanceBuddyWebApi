import React, { useState } from "react";
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    Divider,
    Collapse,
    IconButton,
} from "@mui/material";
import { createExpenseCategory } from "../../api/expenseCategory";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const ExpenseCategoryForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({ name: "", budget: "" });
    const [open, setOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createExpenseCategory({
            ...formData,
            budget: parseFloat(formData.budget || "0"),
        });
        setFormData({ name: "", budget: "" });
        onSuccess();
        setOpen(false); // collapse form
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
                <Typography variant="h6">Add New Expense Category</Typography>
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
                        label="Budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                    />
                    <Button variant="contained" color="primary" type="submit">
                        Add Category
                    </Button>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default ExpenseCategoryForm;
