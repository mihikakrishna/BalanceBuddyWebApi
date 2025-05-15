// styles/theme.js
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
    createTheme({
        palette: {
            mode,
            primary: {
                main: "#A291FA", // Tropical Indigo
            },
            secondary: {
                main: "#62CDDC", // Robin Egg Blue
            },
            success: {
                main: "#6BBA6C", // Mantis
            },
            error: {
                main: "#FF599A", // Cyclamen
            },
            background: {
                default:
                    mode === "light"
                        ? "rgba(245, 245, 245, 0.7)"
                        : "rgba(18, 18, 18, 0.7)",
            },
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        borderBottom: "1px solid #ccc",
                        backgroundImage:
                            "linear-gradient(to right, #A291FA, #6BBA6C, #62CDDC, #FF599A)",
                        backdropFilter: "blur(10px)",
                        color: "#fff",
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        backdropFilter: "blur(12px)",
                    },
                },
            },
        },
        typography: {
            fontFamily: "Roboto, Arial, sans-serif",
        },
    });
