import React, { useEffect, useState } from "react";
import { fetchExpenses, createExpense, deleteExpense } from "../api/expenses";
import ExpensesList from "../features/expenses/ExpensesList";
import ExpenseForm from "../features/expenses/ExpenseForm";

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadExpenses = async () => {
        try {
            const data = await fetchExpenses();
            setExpenses(data);
        } catch (err) {
            console.error("Failed to load expenses", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (newExpense) => {
        await createExpense(newExpense);
        await loadExpenses();
    };

    const handleDelete = async (id) => {
        await deleteExpense(id);
        await loadExpenses();
    };

    useEffect(() => {
        loadExpenses();
    }, []);

    return (
        <div>
            <h2>Expenses Page</h2>
            <ExpenseForm onSubmit={handleCreate} />
            {loading ? <p>Loading...</p> : <ExpensesList expenses={expenses} onDelete={handleDelete} />}
        </div>
    );
};

export default ExpensesPage;
