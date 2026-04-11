import React, { useState } from "react";
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    Collapse,
    IconButton,
    Divider,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const initialFormData = {
    cardName: "",
    issuer: "",
    last4: "",
    openedDate: null,
    annualFee: "",
    pointsBalance: "",
    reminderDate: null,
    notes: "",
    isClosed: false,
    closedDate: null,
};

const CreditCardForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [open, setOpen] = useState(false);
    const [openedDateError, setOpenedDateError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
                ...(name === "isClosed" && !checked ? { closedDate: null } : {}),
            }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.openedDate) {
            setOpenedDateError("Opened date is required.");
            return;
        }

        await onSubmit({
            cardName: formData.cardName.trim(),
            issuer: formData.issuer.trim(),
            last4: formData.last4.trim() || null,
            openedDate: formData.openedDate.toISOString(),
            annualFee: parseFloat(formData.annualFee || "0"),
            pointsBalance: parseInt(formData.pointsBalance || "0", 10),
            reminderDate: formData.reminderDate?.toISOString() || null,
            notes: formData.notes.trim() || null,
            isClosed: formData.isClosed,
            closedDate: formData.isClosed
                ? formData.closedDate?.toISOString() || null
                : null,
        });

        setFormData(initialFormData);
        setOpenedDateError("");
        setOpen(false);
    };

    return (
        <Paper
            elevation={3}
            sx={(theme) => ({
                p: 2,
                mt: 4,
                borderRadius: 3,
                maxWidth: 900,
                margin: "auto",
                backgroundColor:
                    theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.7)",
                backdropFilter: "blur(10px)",
            })}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Add Credit Card</Typography>
                <IconButton onClick={() => setOpen(!open)}>
                    {open ? <RemoveIcon /> : <AddIcon />}
                </IconButton>
            </Box>

            <Collapse in={open} unmountOnExit>
                <Divider sx={{ my: 2 }} />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Card Name"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Issuer"
                            name="issuer"
                            value={formData.issuer}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Last 4 Digits"
                            name="last4"
                            value={formData.last4}
                            onChange={handleChange}
                            inputProps={{ maxLength: 4 }}
                            fullWidth
                        />
                        <DatePicker
                            label="Opened Date"
                            value={formData.openedDate}
                            onChange={(newValue) => {
                                setFormData((prev) => ({ ...prev, openedDate: newValue }));
                                if (newValue) setOpenedDateError("");
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    fullWidth
                                    error={!!openedDateError}
                                    helperText={openedDateError}
                                />
                            )}
                        />
                        <TextField
                            label="Annual Fee"
                            type="number"
                            name="annualFee"
                            value={formData.annualFee}
                            onChange={handleChange}
                            step="0.01"
                            required
                            fullWidth
                        />
                        <TextField
                            label="Points"
                            type="number"
                            name="pointsBalance"
                            value={formData.pointsBalance}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <DatePicker
                            label="Reminder Date"
                            value={formData.reminderDate}
                            onChange={(newValue) =>
                                setFormData((prev) => ({ ...prev, reminderDate: newValue }))
                            }
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        <DatePicker
                            label="Closed Date"
                            value={formData.closedDate}
                            onChange={(newValue) =>
                                setFormData((prev) => ({ ...prev, closedDate: newValue }))
                            }
                            disabled={!formData.isClosed}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        <TextField
                            label="Notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            multiline
                            minRows={2}
                            fullWidth
                            sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}
                        />
                        <FormControlLabel
                            sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}
                            control={
                                <Checkbox
                                    name="isClosed"
                                    checked={formData.isClosed}
                                    onChange={handleChange}
                                />
                            }
                            label="Card is closed"
                        />
                        <Box
                            sx={{
                                gridColumn: { xs: "1", md: "1 / -1" },
                                display: "flex",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button variant="contained" color="primary" type="submit">
                                Create
                            </Button>
                        </Box>
                    </Box>
                </LocalizationProvider>
            </Collapse>
        </Paper>
    );
};

export default CreditCardForm;
