import React, { useState } from "react";
import {
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
} from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Wraps any chart component so it can expand into a dialog.
 * Props:
 *   title   – string
 *   height  – css height for the dashboard view (e.g. 320)
 *   children – the <Chart /> element
 */
const ExpandableChart = ({ title, height = 320, children }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* dashboard card */}
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    position: "relative",
                    cursor: "pointer",
                    "&:hover": { boxShadow: 8 },
                }}
                onClick={() => setOpen(true)}
            >
                <Typography variant="h6" mb={1}>
                    {title}
                </Typography>
                <Box sx={{ height }}>{children}</Box>
                <IconButton
                    size="small"
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <OpenInFullIcon fontSize="inherit" />
                </IconButton>
            </Paper>

            {/* dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl" fullWidth>
                <DialogTitle
                    sx={{ m: 0, p: 2, display: "flex", alignItems: "center" }}
                >
                    <Box flexGrow={1}>{title}</Box>
                    <IconButton onClick={() => setOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ height: "80vh" }}>
                    {/* 100% height so the chart scales */}
                    <Box sx={{ height: "100%" }}>{children}</Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ExpandableChart;
