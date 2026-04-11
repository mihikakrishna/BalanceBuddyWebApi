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
import { LineChart } from "@mui/x-charts/LineChart";
import ExpandableChart from "./ExpandableChart";
import { chartPalette } from "../theme";

const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("en", { month: "short" })
);

const ExpenseBudgetHeatmap = ({ year: initialYear }) => {
    const [year, setYear] = useState(initialYear);
    const [monthRange, setMonthRange] = useState([1, 12]);
    const [focusCount, setFocusCount] = useState(6);
    const [categories, setCategories] = useState([]);
    const [matrix, setMatrix] = useState([]);
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

        fetch(`/api/charts/expense-budget?year=${year}`)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load expense budget chart (${response.status})`);
                }
                return response.json();
            })
            .then((payload) => {
                if (ignore) {
                    return;
                }
                setCategories(Array.from(payload.categories || []));
                setMatrix(payload.values || []);
                setLoading(false);
            })
            .catch((err) => {
                if (ignore) {
                    return;
                }
                setError(err.message || "Failed to load chart data.");
                setCategories([]);
                setMatrix([]);
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [year]);

    const [startMonth, endMonth] = monthRange;
    const monthIndices = useMemo(() => {
        return Array.from({ length: endMonth - startMonth + 1 }, (_, idx) => startMonth - 1 + idx);
    }, [endMonth, startMonth]);

    const rankedCategories = useMemo(() => {
        return categories
            .map((name, idx) => {
                const points = (matrix[idx] || []).map(Number);
                const avg = points.length ? points.reduce((sum, value) => sum + value, 0) / points.length : 0;
                return { name, idx, avg };
            })
            .sort((a, b) => b.avg - a.avg)
            .slice(0, focusCount);
    }, [categories, focusCount, matrix]);

    const xLabels = monthIndices.map((idx) => monthLabels[idx]);
    const chartSeries = rankedCategories.map((category, idx) => ({
        id: `budget-series-${category.idx}`,
        label: category.name,
        data: monthIndices.map((monthIndex) => Number((matrix[category.idx] || [])[monthIndex] || 0) * 100),
        showMark: monthIndices.length <= 6,
        area: true,
        curve: "catmullRom",
        color: chartPalette[idx % chartPalette.length],
        valueFormatter: (value) => `${value.toFixed(1)}%`,
    }));

    const controls = (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="budget-year-label">Year</InputLabel>
                <Select
                    labelId="budget-year-label"
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
                    Month range: {monthLabels[startMonth - 1]} - {monthLabels[endMonth - 1]}
                </Typography>
                <Slider
                    value={monthRange}
                    min={1}
                    max={12}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    aria-label="Budget month range"
                    onChange={(_, value) => {
                        if (Array.isArray(value)) {
                            setMonthRange(value);
                        }
                    }}
                />
            </Box>

            <Box sx={{ minWidth: 170, px: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Focus categories: {focusCount}
                </Typography>
                <Slider
                    size="small"
                    min={3}
                    max={12}
                    step={1}
                    value={focusCount}
                    onChange={(_, value) => setFocusCount(Number(value))}
                    valueLabelDisplay="auto"
                    aria-label="Focus category count"
                />
            </Box>
        </Stack>
    );

    return (
        <ExpandableChart
            title="Budget Utilization Explorer"
            subtitle={`Percent of monthly budget used in ${year}`}
            controls={controls}
            height={390}
        >
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {loading ? <CircularProgress /> : null}

                {!loading && error ? (
                    <Alert severity="error" sx={{ width: "100%" }}>
                        {error}
                    </Alert>
                ) : null}

                {!loading && !error && chartSeries.length === 0 ? (
                    <Typography color="text.secondary">No budget usage trends found for this year.</Typography>
                ) : null}

                {!loading && !error && chartSeries.length > 0 ? (
                    <LineChart
                        xAxis={[{ scaleType: "point", data: xLabels }]}
                        yAxis={[{ min: 0, max: 100, valueFormatter: (value) => `${Math.round(value)}%` }]}
                        series={chartSeries}
                        grid={{ horizontal: true }}
                        height={360}
                        margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
                    />
                ) : null}
            </Box>
        </ExpandableChart>
    );
};

export default ExpenseBudgetHeatmap;
