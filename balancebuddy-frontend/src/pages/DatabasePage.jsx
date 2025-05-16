import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";

const DatabasePage = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [files, setFiles] = useState([]);
    const [current, setCurrent] = useState("");
    const [selected, setSelected] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [newName, setNewName] = useState("");
    const [busy, setBusy] = useState(false);

    /* ───────── helpers ───────── */

    const refresh = async () => {
        const [{ data: list }, { data: cur }] = await Promise.all([
            axios.get("/api/database/list"),
            axios.get("/api/database/current"),
        ]);
        setFiles(list);
        setCurrent(cur);
        setSelected(cur);
    };

    /* ───────── lifecycle ───────── */

    useEffect(() => {
        refresh();
    }, []);

    /* ───────── actions ───────── */

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
        enqueueSnackbar("Uploaded and switched to new database", {
            variant: "success",
        });
        setUploadFile(null);
    });

    const createDb = wrap(async () => {
        if (!newName.trim()) throw new Error("Enter a file name.");
        if (!newName.endsWith(".db")) setNewName((n) => (n += ".db"));
        await axios.post("/api/database/create", { fileName: newName });
        enqueueSnackbar(`Created "${newName}" and switched.`, {
            variant: "success",
        });
        setNewName("");
    });

    const exportDb = wrap(async () => {
        // opens file download in browser
        window.location.href =
            "/api/database/export?fileName=" +
            encodeURIComponent(`balancebuddy_${Date.now()}.db`);
    });

    /* ───────── UI ───────── */

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Database Management
            </Typography>

            {busy && <LinearProgress sx={{ mb: 2 }} />}

            <Grid container spacing={3}>
                {/* current */}
                <Grid item xs={12} md={3}>
                    <Card elevation={3}>
                        <CardHeader title="Current" />
                        <Divider />
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ wordBreak: "break-all" }}>
                                {current || "—"}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 2 }}
                                onClick={exportDb}
                                disabled={busy}
                            >
                                Export
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* switch */}
                <Grid item xs={12} md={3}>
                    <Card elevation={3}>
                        <CardHeader title="Switch" />
                        <Divider />
                        <CardContent>
                            <Stack spacing={2}>
                                <Select
                                    fullWidth
                                    value={selected}
                                    displayEmpty
                                    onChange={(e) => setSelected(e.target.value)}
                                >
                                    {files.map((f) => (
                                        <MenuItem key={f} value={f}>
                                            {f}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Button variant="contained" onClick={switchDb} disabled={busy}>
                                    Switch
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* upload */}
                <Grid item xs={12} md={3}>
                    <Card elevation={3}>
                        <CardHeader title="Upload" />
                        <Divider />
                        <CardContent>
                            <Stack spacing={2}>
                                <TextField
                                    type="file"
                                    inputProps={{ accept: ".db" }}
                                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={upload}
                                    disabled={busy || !uploadFile}
                                >
                                    Upload &amp; Use
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* create */}
                <Grid item xs={12} md={3}>
                    <Card elevation={3}>
                        <CardHeader title="Create New" />
                        <Divider />
                        <CardContent>
                            <Stack spacing={2}>
                                <TextField
                                    placeholder="mydata.db"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={createDb}
                                    disabled={busy || !newName.trim()}
                                >
                                    Create &amp; Use
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DatabasePage;
