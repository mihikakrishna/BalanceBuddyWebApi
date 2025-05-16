import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import ExpandableChart from "./ExpandableChart";
import { chartPalette } from "../theme";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const months = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("en", { month: "short" })
);

const IncomeExpenseStackedBar = ({ year }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`/api/charts/monthly-stack?year=${year}`)
            .then((r) => r.json())
            .then(({ income, expenses }) =>
                setData({
                    labels: months,
                    datasets: [
                        {
                            label: "Income",
                            data: income,
                            backgroundColor: "#4e79a7",
                            stack: "s",
                        },
                        {
                            label: "Expenses",
                            data: expenses.map((v) => -v),
                            backgroundColor: "#e15759",
                            stack: "s",
                        },
                    ],
                })
            );
    }, [year]);

    if (!data) return null;
    return (
        <ExpandableChart title={`Income vs Expense – ${year}`}>
            <Bar
                data={data}
                options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: {
                        y: { ticks: { callback: (v) => Math.abs(v) }, stacked: true },
                        x: { stacked: true },
                    },
                }}
            />
        </ExpandableChart>
    );
};

export default IncomeExpenseStackedBar;
