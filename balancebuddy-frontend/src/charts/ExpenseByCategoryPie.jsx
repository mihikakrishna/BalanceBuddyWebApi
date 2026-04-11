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
import { PieChart } from "@mui/x-charts/PieChart";
import ExpandableChart from "./ExpandableChart";
import { chartPalette } from "../theme";

const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const ExpenseByCategoryPie = () => {
    const now = new Date();
    const defaultMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const defaultYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const [year, setYear] = useState(defaultYear);
    const [month, setMonth] = useState(defaultMonth);
    const [topCount, setTopCount] = useState(8);
    const [seriesData, setSeriesData] = useState([]);
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

        fetch(`/api/charts/expenses-by-category?year=${year}&month=${month}`)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load category expenses (${response.status})`);
                }
                return response.json();
            })
            .then((rows) => {
                if (ignore) {
                    return;
                }

                const sorted = [...rows].sort((a, b) => Number(b.total) - Number(a.total));
                const focused = sorted.slice(0, topCount);
                const remainder = sorted.slice(topCount);
                const remainderTotal = remainder.reduce((sum, item) => sum + Number(item.total), 0);

                const mapped = focused.map((item, index) => ({
                    id: `${item.category}-${index}`,
                    value: Number(item.total),
                    label: item.category,
                    color: chartPalette[index % chartPalette.length],
                }));

                if (remainderTotal > 0) {
                    mapped.push({
                        id: "other",
                        value: remainderTotal,
                        label: "Other",
                        color: "#9CA3AF",
                    });
                }

                setSeriesData(mapped);
                setLoading(false);
            })
            .catch((err) => {
                if (ignore) {
                    return;
                }
                setError(err.message || "Failed to load chart data.");
                setSeriesData([]);
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [month, topCount, year]);

    const controls = (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="expense-chart-year-label">Year</InputLabel>
                <Select
                    labelId="expense-chart-year-label"
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

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="expense-chart-month-label">Month</InputLabel>
                <Select
                    labelId="expense-chart-month-label"
                    label="Month"
                    value={month}
                    onChange={(event) => setMonth(Number(event.target.value))}
                >
                    {monthLabels.map((label, idx) => (
                        <MenuItem key={label} value={idx + 1}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box sx={{ minWidth: 170, px: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Focus top {topCount}
                </Typography>
                <Slider
                    size="small"
                    min={3}
                    max={12}
                    step={1}
                    value={topCount}
                    onChange={(_, value) => setTopCount(Number(value))}
                    valueLabelDisplay="auto"
                    aria-label="Focus top categories"
                />
            </Box>
        </Stack>
    );

    return (
        <ExpandableChart
            title="Expense Composition"
            subtitle={`${monthLabels[month - 1]} ${year}`}
            controls={controls}
        >
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {loading ? <CircularProgress /> : null}

                {!loading && error ? (
                    <Alert severity="error" sx={{ width: "100%" }}>
                        {error}
                    </Alert>
                ) : null}

                {!loading && !error && seriesData.length === 0 ? (
                    <Typography color="text.secondary">No expense data found for this period.</Typography>
                ) : null}

                {!loading && !error && seriesData.length > 0 ? (
                    <PieChart
                        colors={chartPalette}
                        series={[
                            {
                                data: seriesData,
                                innerRadius: 72,
                                outerRadius: 146,
                                paddingAngle: 2,
                                cornerRadius: 8,
                                highlightScope: { faded: "global", highlighted: "item" },
                                faded: { additionalRadius: -6, color: "#94A3B8" },
                                arcLabel: (item) => `$${item.value.toFixed(0)}`,
                                arcLabelMinAngle: 14,
                            },
                        ]}
                        slotProps={{ legend: { direction: "column", position: { vertical: "middle", horizontal: "right" } } }}
                        margin={{ top: 10, bottom: 10, left: 10, right: 190 }}
                        height={330}
                    />
                ) : null}
            </Box>
        </ExpandableChart>
    );
};

export default ExpenseByCategoryPie;
