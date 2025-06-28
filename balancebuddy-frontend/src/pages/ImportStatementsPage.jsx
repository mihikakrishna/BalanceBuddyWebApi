import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Snackbar,
    Alert,
} from "@mui/material";

const ImportStatementsPage = () => {
    const [file, setFile] = useState(null);
    const [bankId, setBankId] = useState("");
    const [bankList, setBankList] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    useEffect(() => {
        fetch("/api/import/banks")
            .then((res) => res.json())
            .then((data) => setBankList(data))
            .catch(() => setBankList([]));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !bankId) {
            setSnackbar({
                open: true,
                message: "Please select a bank and a CSV file.",
                severity: "warning",
            });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("bankId", bankId);

        try {
            const res = await fetch("/api/import", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setSnackbar({
                    open: true,
                    message: "Import successful!",
                    severity: "success",
                });
                setFile(null);
                setBankId("");
            } else {
                const text = await res.text();
                setSnackbar({
                    open: true,
                    message: text || "Import failed.",
                    severity: "error",
                });
            }
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "An unexpected error occurred.",
                severity: "error",
            });
        }
    };

    return (
        <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Import Bank Statement
            </Typography>

            <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ my: 2 }}>
                    <InputLabel id="bank-label">Bank</InputLabel>
                    <Select
                        labelId="bank-label"
                        value={bankId}
                        label="Bank"
                        onChange={(e) => setBankId(e.target.value)}
                    >
                        {bankList.map((bank) => (
                            <MenuItem key={bank} value={bank}>
                                {bank}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Upload
                </Button>
            </form>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ImportStatementsPage;
