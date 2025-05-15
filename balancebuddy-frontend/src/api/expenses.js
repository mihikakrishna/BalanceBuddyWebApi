const BASE_URL = "/api/expenses";

export async function fetchExpenses() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch expenses");
    return await res.json();
}

export async function createExpense(expense) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error("Failed to create expense");
    return await res.json();
}

export async function deleteExpense(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete expense");
}

export async function updateExpense(id, expense) {
    const res = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", res.status, text);
        throw new Error("Failed to update expense");
    }

    if (res.status === 204) return;

    return await res.json();
}
