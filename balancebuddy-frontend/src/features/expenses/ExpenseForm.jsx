import React, { useEffect, useState } from "react";
import {
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Button,
    Paper,
    Typography,
    Box,
    Collapse,
    IconButton,
    Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const ExpenseForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        date: null,
        description: "",
        amount: "",
        expenseCategoryId: "",
    });

    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch("/api/expensecategory")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => setCategories(data))
            .catch((err) => console.error("Error loading categories:", err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit({
            ...formData,
            date: formData.date?.toISOString() || "",
        });
        setFormData({
            date: null,
            description: "",
            amount: "",
            expenseCategoryId: "",
        });
        setOpen(false);
    };

    return (
        <Paper
            elevation={3}
            sx={(theme) => ({
                p: 2,
                mt: 4,
                borderRadius: 3,
                maxWidth: 600,
                margin: "auto",
                backgroundColor:
                    theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0)"
                        : "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(10px)",
                color: theme.palette.text.primary,
            })}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Add New Expense</Typography>
                <IconButton onClick={() => setOpen(!open)}>
                    {open ? <RemoveIcon /> : <AddIcon />}
                </IconButton>
            </Box>

            <Collapse in={open}>
                <Divider sx={{ my: 2 }} />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                        <DatePicker
                            label="Date"
                            value={formData.date}
                            onChange={(newValue) =>
                                setFormData({ ...formData, date: newValue })
                            }
                            renderInput={(params) => (
                                <TextField {...params} required fullWidth />
                            )}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Amount"
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            required
                            fullWidth
                        />
                        <FormControl required fullWidth>
                            <InputLabel id="category-label">Category</InputLabel>
                            <Select
                                labelId="category-label"
                                name="expenseCategoryId"
                                value={formData.expenseCategoryId}
                                label="Category"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Select Category</em>
                                </MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ alignSelf: "flex-end" }}
                        >
                            Create
                        </Button>
                    </Box>
                </LocalizationProvider>
            </Collapse>
        </Paper>
    );
};

export default ExpenseForm;
