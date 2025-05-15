/* eslint-disable no-unused-vars */
const BASE_URL = "/api/incomes";

export async function fetchIncomes() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch incomes");
    return await res.json();
}

export async function createIncome(income) {
    const { id, category, amount, incomeCategoryId, ...rest } = income;
    const safeIncome = {
        ...rest,
        amount: parseFloat(amount || "0"),
        incomeCategoryId: parseInt(incomeCategoryId || "0")
    };

    console.log("Creating with payload:", safeIncome);

    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeIncome),
    });

    if (!res.ok) throw new Error("Failed to create income");
    return await res.json();
}

export async function updateIncome(id, updatedIncome) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedIncome),
    });

    if (!res.ok) throw new Error("Failed to update income");

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export async function deleteIncome(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete income");
}
