import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    CircularProgress,
    Slider,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ExpandableChart from "./ExpandableChart";
import { chartPalette } from "../theme";

const BankBalancesPie = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [topCount, setTopCount] = useState(8);
    const [sortDirection, setSortDirection] = useState("desc");

    useEffect(() => {
        let ignore = false;

        setLoading(true);
        setError("");

        fetch("/api/charts/bankbalances")
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load bank balances (${response.status})`);
                }
                return response.json();
            })
            .then((rows) => {
                if (ignore) {
                    return;
                }
                const mapped = (rows || []).map((row) => ({
                    name: row.name,
                    balance: Number(row.balance),
                }));
                setAccounts(mapped);
                setLoading(false);
            })
            .catch((err) => {
                if (ignore) {
                    return;
                }
                setError(err.message || "Failed to load chart data.");
                setAccounts([]);
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, []);

    const sorted = useMemo(() => {
        const cloned = [...accounts];
        cloned.sort((a, b) => (sortDirection === "desc" ? b.balance - a.balance : a.balance - b.balance));
        return cloned.slice(0, topCount);
    }, [accounts, sortDirection, topCount]);

    const controls = (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup
                size="small"
                value={sortDirection}
                exclusive
                onChange={(_, value) => {
                    if (value) {
                        setSortDirection(value);
                    }
                }}
                aria-label="Sort balance direction"
            >
                <ToggleButton value="desc">Largest</ToggleButton>
                <ToggleButton value="asc">Smallest</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ minWidth: 170, px: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Show top {topCount}
                </Typography>
                <Slider
                    size="small"
                    min={3}
                    max={12}
                    step={1}
                    value={topCount}
                    onChange={(_, value) => setTopCount(Number(value))}
                    valueLabelDisplay="auto"
                    aria-label="Show top bank accounts"
                />
            </Box>
        </Stack>
    );

    return (
        <ExpandableChart
            title="Bank Balance Leaderboard"
            subtitle="Account ranking with drill controls"
            controls={controls}
        >
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {loading ? <CircularProgress /> : null}

                {!loading && error ? (
                    <Alert severity="error" sx={{ width: "100%" }}>
                        {error}
                    </Alert>
                ) : null}

                {!loading && !error && sorted.length === 0 ? (
                    <Typography color="text.secondary">No account balances found.</Typography>
                ) : null}

                {!loading && !error && sorted.length > 0 ? (
                    <BarChart
                        xAxis={[{ scaleType: "band", data: sorted.map((account) => account.name) }]}
                        yAxis={[
                            {
                                valueFormatter: (value) => `$${value.toLocaleString()}`,
                                tickNumber: 6,
                            },
                        ]}
                        series={[
                            {
                                id: "bank-balance-series",
                                label: "Balance",
                                data: sorted.map((account) => account.balance),
                                color: chartPalette[0],
                            },
                        ]}
                        grid={{ horizontal: true }}
                        height={330}
                        margin={{ left: 70, right: 20, top: 20, bottom: 80 }}
                    />
                ) : null}
            </Box>
        </ExpandableChart>
    );
};

export default BankBalancesPie;
