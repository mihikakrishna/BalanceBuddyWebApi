import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ExpandableChart from "./ExpandableChart";
import { chartPalette } from "../theme";
import { Box, Typography, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, subMonths, setDate } from "date-fns";

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseByCategoryPie = () => {
    const [selectedMonth, setSelectedMonth] = useState(
        setDate(subMonths(new Date(), 1), 1)
    );
    const [data, setData] = useState(null);

    const monthParam = format(selectedMonth, "yyyy-MM");

    useEffect(() => {
        const [y, m] = monthParam.split("-");
        fetch(`/api/charts/expenses-by-category?year=${y}&month=${parseInt(m)}`)
            .then((r) => r.json())
            .then((series) =>
                setData({
                    labels: series.map((s) => s.category),
                    datasets: [
                        {
                            data: series.map((s) => s.total),
                            backgroundColor: chartPalette,
                        },
                    ],
                })
            )
            .catch((err) => {
                console.error("Failed to load chart data", err);
                setData(null);
            });
    }, [monthParam]);

    return (
        <ExpandableChart
            title={`Expenses by Category – ${format(selectedMonth, "MMMM yyyy")}`}
        >
            {data && data.labels.length > 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    {/* Date Picker */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            views={["year", "month"]}
                            label="Select Month"
                            minDate={new Date("2020-01-01")}
                            maxDate={new Date()}
                            value={selectedMonth}
                            onChange={(newValue) => {
                                if (newValue) setSelectedMonth(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} size="small" />
                            )}
                        />
                    </LocalizationProvider>

                    {/* Pie Chart */}
                    <Box
                        sx={{
                            flex: "none", // prevents stretching
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Pie
                            data={data}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        position: "bottom",
                                    },
                                },
                            }}
                        />
                    </Box>
                </Box>
            ) : (
                <>
                    {/* Date Picker above no-data */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 2,
                        }}
                    >
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                views={["year", "month"]}
                                label="Select Month"
                                minDate={new Date("2020-01-01")}
                                maxDate={new Date()}
                                value={selectedMonth}
                                onChange={(newValue) => {
                                    if (newValue) setSelectedMonth(newValue);
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} size="small" />
                                )}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* No data message */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            minHeight: 200,
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                        >
                            No data available for this month.
                        </Typography>
                    </Box>
                </>
            )}
        </ExpandableChart>
    );
};

export default ExpenseByCategoryPie;
