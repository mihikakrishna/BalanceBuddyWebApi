import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ExpandableChart from "./ExpandableChart";

ChartJS.register(ArcElement, Tooltip, Legend);

const BankBalancesPie = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("/api/charts/bankbalances")
            .then((r) => r.json())
            .then((accounts) =>
                setData({
                    labels: accounts.map((a) => a.name),
                    datasets: [
                        {
                            data: accounts.map((a) => a.balance),
                            backgroundColor: [
                                "#4e79a7",
                                "#f28e2b",
                                "#e15759",
                                "#76b7b2",
                                "#59a14f",
                                "#edc949",
                            ],
                        },
                    ],
                })
            );
    }, []);

    if (!data) return null;
    return (
        <ExpandableChart title="Bank Balances">
            <Pie data={data} />
        </ExpandableChart>
    );
};

export default BankBalancesPie;
