import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ExpandableChart from "./ExpandableChart";

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseByCategoryPie = ({ month /* "YYYY-MM" */ }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const [y, m] = month.split("-");
        fetch(`/api/charts/expenses-by-category?year=${y}&month=${parseInt(m)}`)
            .then((r) => r.json())
            .then((series) =>
                setData({
                    labels: series.map((s) => s.category),
                    datasets: [
                        {
                            data: series.map((s) => s.total),
                            backgroundColor: series.map(
                                (_, i) =>
                                    ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949"][
                                    i % 6
                                    ]
                            ),
                        },
                    ],
                })
            );
    }, [month]);

    if (!data) return null;
    return (
        <ExpandableChart title={`Expenses by Category – ${month}`}>
            <Pie data={data} />
        </ExpandableChart>
    );
};

export default ExpenseByCategoryPie;
