import React, { useMemo, useState } from "react";
import {
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Stack,
    useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";

const ExpandableChart = ({ title, subtitle, height = 360, controls, children }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const panelGradient = useMemo(() => {
        return theme.palette.mode === "dark"
            ? "linear-gradient(165deg, rgba(20,28,44,0.96), rgba(20,40,64,0.9), rgba(16,23,37,0.92))"
            : "linear-gradient(165deg, rgba(255,255,255,0.98), rgba(237,248,255,0.95), rgba(246,252,255,0.94))";
    }, [theme.palette.mode]);

    const renderContent = (contentHeight) => (
        <Box
            sx={{
                height: contentHeight,
                width: "100%",
                display: "flex",
                alignItems: "stretch",
                justifyContent: "stretch",
                p: { xs: 1, md: 2 },
                borderRadius: 2,
                background: panelGradient,
                border: "1px solid",
                borderColor:
                    theme.palette.mode === "dark"
                        ? alpha("#8CD4FF", 0.25)
                        : alpha("#0284C7", 0.2),
                boxShadow:
                    theme.palette.mode === "dark"
                        ? "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -20px 40px rgba(0,0,0,0.2)"
                        : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -20px 40px rgba(2,132,199,0.08)",
                overflow: "hidden",
            }}
        >
            {children}
        </Box>
    );

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor:
                        theme.palette.mode === "dark"
                            ? alpha("#8CD4FF", 0.35)
                            : alpha("#0284C7", 0.25),
                    background:
                        theme.palette.mode === "dark"
                            ? "linear-gradient(175deg, rgba(10,16,30,0.88), rgba(18,33,56,0.8))"
                            : "linear-gradient(175deg, rgba(255,255,255,0.9), rgba(240,249,255,0.78))",
                    boxShadow:
                        theme.palette.mode === "dark"
                            ? "0 18px 34px rgba(0,0,0,0.35)"
                            : "0 16px 30px rgba(2,132,199,0.12)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow:
                            theme.palette.mode === "dark"
                                ? "0 22px 40px rgba(0,0,0,0.45)"
                                : "0 20px 36px rgba(2,132,199,0.16)",
                    },
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                    spacing={1}
                    mb={2}
                >
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {title}
                        </Typography>
                        {subtitle ? (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        ) : null}
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {controls}
                        <IconButton
                            aria-label={`Expand ${title}`}
                            onClick={() => setOpen(true)}
                            size="small"
                        >
                            <OpenInFullIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>

                {renderContent(height)}
            </Paper>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor:
                            theme.palette.mode === "dark"
                                ? alpha("#8CD4FF", 0.3)
                                : alpha("#0284C7", 0.2),
                    },
                }}
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box flexGrow={1}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {title}
                        </Typography>
                        {subtitle ? (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        ) : null}
                    </Box>
                    <IconButton aria-label="Close expanded chart" onClick={() => setOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ height: "82vh" }}>
                    <Stack spacing={2} sx={{ height: "100%" }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            {controls}
                        </Stack>
                        <Box sx={{ flex: 1 }}>{renderContent("100%")}</Box>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ExpandableChart;
