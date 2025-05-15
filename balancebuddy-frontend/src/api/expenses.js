/* eslint-disable no-unused-vars */
const BASE_URL = "/api/expenses";

export async function fetchExpenses() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch expenses");
    return await res.json();
}

export async function createExpense(expense) {
    const { id, category, amount, expenseCategoryId, ...rest } = expense;
    const safeExpense = {
        ...rest,
        amount: parseFloat(amount || "0"),
        expenseCategoryId: parseInt(expenseCategoryId || "0")
    };

    console.log("Creating with payload:", safeExpense);

    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeExpense),
    });

    if (!res.ok) throw new Error("Failed to create expense");
    return await res.json();
}

export async function updateExpense(id, updatedExpense) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedExpense),
    });

    if (!res.ok) throw new Error("Failed to update expense");

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export async function deleteExpense(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete expense");
}
