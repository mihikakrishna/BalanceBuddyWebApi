import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";

const DatabasePage = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [tabIndex, setTabIndex] = useState(0);
    const [files, setFiles] = useState([]);
    const [current, setCurrent] = useState("");
    const [selected, setSelected] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [newName, setNewName] = useState("");
    const [busy, setBusy] = useState(false);

    const refresh = async () => {
        const [{ data: list }, { data: cur }] = await Promise.all([
            axios.get("/api/database/list"),
            axios.get("/api/database/current"),
        ]);
        setFiles(list);
        setCurrent(cur);
        setSelected(cur);
    };

    useEffect(() => {
        refresh();
    }, []);

    const wrap = (fn) => async (...args) => {
        try {
            setBusy(true);
            await fn(...args);
            await refresh();
        } catch (err) {
            enqueueSnackbar(err.response?.data ?? err.message, { variant: "error" });
        } finally {
            setBusy(false);
        }
    };

    const switchDb = wrap(async () => {
        if (!selected) throw new Error("Choose a database first.");
        await axios.post("/api/database/switch", { fileName: selected });
        enqueueSnackbar(`Switched to "${selected}"`, { variant: "success" });
    });

    const upload = wrap(async () => {
        if (!uploadFile) throw new Error("Select a .db file to upload.");
        const form = new FormData();
        form.append("file", uploadFile);
        await axios.post("/api/database/upload", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        enqueueSnackbar("Uploaded and switched to new database", { variant: "success" });
        setUploadFile(null);
    });

    const createDb = wrap(async () => {
        if (!newName.trim()) throw new Error("Enter a file name.");
        const fileName = newName.endsWith(".db") ? newName : `${newName}.db`;
        await axios.post("/api/database/create", { fileName });
        enqueueSnackbar(`Created "${fileName}" and switched.`, { variant: "success" });
        setNewName("");
    });

    const exportDb = wrap(async () => {
        window.location.href = "/api/database/export?fileName=" + encodeURIComponent(`balancebuddy_${Date.now()}.db`);
    });

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Database Management
            </Typography>

            {busy && <LinearProgress sx={{ mb: 2 }} />}

            <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)} sx={{ mb: 3 }}>
                <Tab label="Current" />
                <Tab label="Switch" />
                <Tab label="Upload" />
                <Tab label="Create New" />
            </Tabs>

            {/* Current Tab */}
            {tabIndex === 0 && (
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ wordBreak: "break-word", mb: 2 }}>
                            Current Database: <strong>{current || "—"}</strong>
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={exportDb}
                            disabled={busy}
                        >
                            Export
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Switch Tab */}
            {tabIndex === 1 && (
                <Card elevation={3}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Select
                                fullWidth
                                value={selected}
                                onChange={(e) => setSelected(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select a .db file</MenuItem>
                                {files.map((f) => (
                                    <MenuItem key={f} value={f}>
                                        {f}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Button
                                variant="contained"
                                onClick={switchDb}
                                disabled={busy || !selected}
                            >
                                Switch
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Upload Tab */}
            {tabIndex === 2 && (
                <Card elevation={3}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Button
                                component="label"
                                variant="outlined"
                                disabled={busy}
                            >
                                Choose File
                                <input
                                    type="file"
                                    hidden
                                    accept=".db"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                                />
                            </Button>
                            {uploadFile && (
                                <Typography variant="body2">{uploadFile.name}</Typography>
                            )}
                            <Button
                                variant="contained"
                                onClick={upload}
                                disabled={busy || !uploadFile}
                            >
                                Upload & Switch
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Create Tab */}
            {tabIndex === 3 && (
                <Card elevation={3}>
                    <CardContent>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                placeholder="mydata.db"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                disabled={busy}
                            />
                            <Button
                                variant="contained"
                                onClick={createDb}
                                disabled={busy || !newName.trim()}
                            >
                                Create & Use
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default DatabasePage;
