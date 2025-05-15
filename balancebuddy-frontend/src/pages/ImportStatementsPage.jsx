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
} from "@mui/material";

const ImportStatementsPage = () => {
    const [file, setFile] = useState(null);
    const [bankId, setBankId] = useState("");
    const [bankList, setBankList] = useState([]);
    const [status, setStatus] = useState("");

    useEffect(() => {
        fetch("/api/import/banks")
            .then((res) => res.json())
            .then((data) => setBankList(data))
            .catch(() => setBankList([]));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !bankId) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("bankId", bankId);

        try {
            const res = await fetch("/api/import", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setStatus("Import successful!");
                setFile(null);
                setBankId("");
            } else {
                setStatus("Import failed.");
            }
        } catch (err) {
            console.error(err);
            setStatus("Import error.");
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

            {status && <Typography sx={{ mt: 2 }}>{status}</Typography>}
        </Paper>
    );
};

export default ImportStatementsPage;
