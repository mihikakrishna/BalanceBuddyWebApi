import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import ExpandableChart from "./ExpandableChart";

const months = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("en", { month: "short" })
);

const ExpenseBudgetHeatmap = ({ year }) => {
    const [cats, setCats] = useState([]);
    const [matrix, setMatrix] = useState([]);

    useEffect(() => {
        fetch(`/api/charts/expense-budget?year=${year}`)
            .then((r) => r.json())
            .then(({ categories, values }) => {
                setCats(Array.from(categories));
                setMatrix(values);
            });
    }, [year]);

    if (!matrix.length) return null;

    return (
        <ExpandableChart title={`Budget vs Expense – ${year}`} height={380}>
            <Plot
                data={[
                    {
                        z: matrix,
                        x: months,
                        y: cats,
                        type: "heatmap",
                        colorscale: [
                            [0, "#8dd57f"],
                            [0.5, "#f8d76d"],
                            [1, "#ff6961"],
                        ],
                        hovertemplate: "%{y} – %{x}<br>%{z:p}<extra></extra>",
                    },
                ]}
                layout={{ margin: { t: 0, r: 20, l: 60, b: 30 } }}
                style={{ width: "100%", height: "100%" }}
                config={{ responsive: true }}
            />
        </ExpandableChart>
    );
};

export default ExpenseBudgetHeatmap;
