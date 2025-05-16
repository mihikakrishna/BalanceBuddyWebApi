import React, { useState } from "react";
import {
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    useTheme,
} from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Wraps any chart component so it can expand into a dialog.
 *
 * Props:
 *   title   – heading shown on card and in dialog
 *   height  – card height (default 320 px)
 *   children – the chart element to render
 */
const ExpandableChart = ({ title, height = 320, children }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    /* Soft grey panel only in dark mode */
    const chartBg =
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "transparent";

    return (
        <>
            {/* ───────── dashboard card ───────── */}
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

                <Box
                    sx={{
                        height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: chartBg,
                        borderRadius: 2,
                    }}
                >
                    {children}
                </Box>

                <IconButton
                    size="small"
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <OpenInFullIcon fontSize="inherit" />
                </IconButton>
            </Paper>

            {/* ───────── full-width dialog ───────── */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle
                    sx={{ m: 0, p: 2, display: "flex", alignItems: "center" }}
                >
                    <Box flexGrow={1}>{title}</Box>
                    <IconButton onClick={() => setOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ height: "80vh" }}>
                    <Box
                        sx={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: chartBg,
                            borderRadius: 2,
                        }}
                    >
                        {children}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ExpandableChart;
