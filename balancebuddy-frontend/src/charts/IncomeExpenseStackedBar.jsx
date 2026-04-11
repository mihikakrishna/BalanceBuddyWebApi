import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Stack,
    Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ExpandableChart from "./ExpandableChart";
import { chartPalette } from "../theme";

const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("en", { month: "short" })
);

const IncomeExpenseStackedBar = ({ year: initialYear }) => {
    const [year, setYear] = useState(initialYear);
    const [windowRange, setWindowRange] = useState([1, 12]);
    const [income, setIncome] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const yearOptions = useMemo(() => {
        const start = 2020;
        const current = new Date().getFullYear();
        return Array.from({ length: current - start + 1 }, (_, i) => start + i).reverse();
    }, []);

    useEffect(() => {
        let ignore = false;

        setLoading(true);
        setError("");

        fetch(`/api/charts/monthly-stack?year=${year}`)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load monthly stack (${response.status})`);
                }
                return response.json();
            })
            .then((payload) => {
                if (ignore) {
                    return;
                }
                setIncome((payload.income || []).map(Number));
                setExpenses((payload.expenses || []).map(Number));
                setLoading(false);
            })
            .catch((err) => {
                if (ignore) {
                    return;
                }
                setError(err.message || "Failed to load chart data.");
                setIncome([]);
                setExpenses([]);
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [year]);

    const filteredIndices = useMemo(() => {
        const [start, end] = windowRange;
        return Array.from({ length: end - start + 1 }, (_, idx) => start - 1 + idx);
    }, [windowRange]);

    const xAxisLabels = filteredIndices.map((index) => monthLabels[index]);
    const incomeData = filteredIndices.map((index) => income[index] || 0);
    const expenseData = filteredIndices.map((index) => expenses[index] || 0);

    const controls = (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="income-expense-year-label">Year</InputLabel>
                <Select
                    labelId="income-expense-year-label"
                    label="Year"
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value))}
                >
                    {yearOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box sx={{ minWidth: 220, px: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Focus months: {monthLabels[windowRange[0] - 1]} - {monthLabels[windowRange[1] - 1]}
                </Typography>
                <Slider
                    value={windowRange}
                    min={1}
                    max={12}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    aria-label="Month range"
                    onChange={(_, value) => {
                        if (Array.isArray(value)) {
                            setWindowRange(value);
                        }
                    }}
                />
            </Box>
        </Stack>
    );

    return (
        <ExpandableChart
            title="Income vs Expense Momentum"
            subtitle={`Stacked monthly flow for ${year}`}
            controls={controls}
        >
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {loading ? <CircularProgress /> : null}

                {!loading && error ? (
                    <Alert severity="error" sx={{ width: "100%" }}>
                        {error}
                    </Alert>
                ) : null}

                {!loading && !error && xAxisLabels.length === 0 ? (
                    <Typography color="text.secondary">No monthly data found.</Typography>
                ) : null}

                {!loading && !error && xAxisLabels.length > 0 ? (
                    <BarChart
                        xAxis={[{ scaleType: "band", data: xAxisLabels }]}
                        yAxis={[
                            {
                                valueFormatter: (value) => `$${Math.round(value)}`,
                                tickNumber: 6,
                            },
                        ]}
                        series={[
                            {
                                id: "income-series",
                                label: "Income",
                                data: incomeData,
                                stack: "cashflow",
                                color: chartPalette[8],
                            },
                            {
                                id: "expense-series",
                                label: "Expenses",
                                data: expenseData,
                                stack: "cashflow",
                                color: chartPalette[1],
                            },
                        ]}
                        grid={{ horizontal: true }}
                        height={330}
                        margin={{ left: 70, right: 20, top: 20, bottom: 30 }}
                    />
                ) : null}
            </Box>
        </ExpandableChart>
    );
};

export default IncomeExpenseStackedBar;
