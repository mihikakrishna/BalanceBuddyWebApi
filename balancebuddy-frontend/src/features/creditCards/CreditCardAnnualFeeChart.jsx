import React, { useMemo } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ExpandableChart from "../../charts/ExpandableChart";
import { chartPalette } from "../../theme";

const buildMonthlyFeeSeries = (cards) => {
    const today = new Date();
    const monthStarts = Array.from({ length: 12 }, (_, idx) => {
        const d = new Date(today.getFullYear(), today.getMonth() + idx, 1);
        return {
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            label: d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
            total: 0,
        };
    });

    const monthIndexByKey = new Map(monthStarts.map((m, idx) => [m.key, idx]));

    for (const card of cards) {
        const dueDate = card?.reminderDate ? new Date(card.reminderDate) : null;
        if (!dueDate || Number.isNaN(dueDate.getTime())) continue;

        const key = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}`;
        const idx = monthIndexByKey.get(key);
        if (idx === undefined) continue;

        monthStarts[idx].total += Number(card.annualFee || 0);
    }

    return monthStarts;
};

const CreditCardAnnualFeeChart = ({ cards }) => {
    const openCards = useMemo(() => cards.filter((c) => !c.isClosed), [cards]);
    const monthlySeries = useMemo(() => buildMonthlyFeeSeries(openCards), [openCards]);

    const overdueCount = useMemo(() => {
        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return openCards.filter((c) => {
            const due = c?.reminderDate ? new Date(c.reminderDate) : null;
            if (!due || Number.isNaN(due.getTime())) return false;
            const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
            return dueDay < todayDate;
        }).length;
    }, [openCards]);

    const totalUpcomingAnnualFees = useMemo(
        () => monthlySeries.reduce((sum, month) => sum + month.total, 0),
        [monthlySeries]
    );

    return (
        <ExpandableChart
            title="Annual Fee Timeline"
            subtitle={`Next 12 months of annual fee due dates (open cards). Overdue cards: ${overdueCount}`}
        >
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {openCards.length === 0 ? (
                    <Typography color="text.secondary">Add open cards to see annual fee projections.</Typography>
                ) : monthlySeries.every((m) => m.total === 0) ? (
                    <Alert severity="info" sx={{ width: "100%" }}>
                        No annual fee due dates set for open cards.
                    </Alert>
                ) : (
                    <BarChart
                        xAxis={[{ scaleType: "band", data: monthlySeries.map((m) => m.label) }]}
                        yAxis={[
                            {
                                valueFormatter: (value) => `$${value.toLocaleString()}`,
                                tickNumber: 6,
                            },
                        ]}
                        series={[
                            {
                                id: "annual-fee-total",
                                label: `Due fees ($${totalUpcomingAnnualFees.toLocaleString()} total)`,
                                data: monthlySeries.map((m) => Number(m.total.toFixed(2))),
                                color: chartPalette[2],
                            },
                        ]}
                        grid={{ horizontal: true }}
                        height={330}
                        margin={{ left: 70, right: 20, top: 20, bottom: 80 }}
                    />
                )}
            </Box>
        </ExpandableChart>
    );
};

export default CreditCardAnnualFeeChart;
