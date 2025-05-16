// styles/theme.js
import { createTheme } from "@mui/material/styles";

const brand = {
    royalBlue: "#3B82F6",
    aqua: "#06B6D4",
    teal: "#14B8A6",
    lime: "#84CC16",
    yellow: "#FACC15",
    orange: "#FB923C",
    red: "#EF4444",
    magenta: "#EC4899",
    violet: "#8B5CF6",
    indigo: "#6366F1",
    cyan: "#22D3EE",
    pink: "#F472B6",
};

export const chartPalette = [
    brand.royalBlue,
    brand.orange,
    brand.lime,
    brand.red,
    brand.aqua,
    brand.yellow,
    brand.violet,
    brand.teal,
    brand.magenta,
    brand.indigo,
    brand.cyan,
    brand.pink,
];

/* ───────────────────────────────  theme factory  ─────────────────────────────── */

export const getTheme = (mode = "light") =>
    createTheme({
        palette: {
            mode,
            primary: { main: brand.royalBlue },
            secondary: { main: brand.aqua },
            success: { main: brand.lime },
            error: { main: brand.red },

            background: {
                default:
                    mode === "light"
                        ? "rgba(245,245,245,0.7)"
                        : "rgba(18,18,18,0.7)",
                paper:
                    mode === "light"
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(30,30,30,0.4)",
            },

            text: {
                primary: mode === "light" ? "#111827" : "#F3F4F6",
                secondary: mode === "light" ? "#4B5563" : "#9CA3AF",
            },
        },

        /* ---------- global typography ---------- */
        typography: {
            fontFamily: "Roboto, Arial, sans-serif",
            h6: { fontWeight: 600 },
        },

        /* ---------- component overrides ---------- */
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
                        backdropFilter: "blur(12px)",
                        backgroundColor:
                            mode === "light"
                                ? "rgba(255,255,255,0.6)"
                                : "rgba(30,30,30,0.4)",
                        borderRadius: 12,
                    },
                },
            },
        },
    });
