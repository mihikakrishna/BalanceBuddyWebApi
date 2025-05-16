import React, { useEffect, useState } from "react";
import {
    fetchIncomes,
    createIncome,
    deleteIncome,
} from "../api/incomes";
import IncomesList from "../features/incomes/IncomesList";
import IncomeForm from "../features/incomes/IncomeForm";

const IncomesPage = () => {
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ---------- helpers ---------- */

    const loadIncomes = async () => {
        try {
            setLoading(true);
            const data = await fetchIncomes();
            setIncomes(data);
        } catch (err) {
            console.error("Failed to load incomes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (newIncome) => {
        await createIncome(newIncome);
        await loadIncomes();
    };

    const handleDelete = async (id) => {
        await deleteIncome(id);
        await loadIncomes();
    };

    /* ---------- mount ---------- */

    useEffect(() => { loadIncomes(); }, []);

    /* ---------- UI ---------- */

    return (
        <div>
            <h2>Incomes Page</h2>

            <IncomeForm onSubmit={handleCreate} />

            {loading
                ? <p>Loading...</p>
                : <IncomesList
                    incomes={incomes}
                    onDelete={handleDelete}
                    refreshIncomes={loadIncomes}
                />}
        </div>
    );
};

export default IncomesPage;
