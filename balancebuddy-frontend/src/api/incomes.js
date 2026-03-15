const BASE_URL = "/api/incomes";
const toNumber = (v) => (v === "" || v == null ? 0 : parseFloat(v));

export async function fetchIncomes() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch incomes");
    return res.json();
}

export async function createIncome(income) {
    const {
        id, category, incomeCategoryId, categoryId = incomeCategoryId, ...rest
    } = income;

    const payload = {
        ...rest,
        amount: toNumber(income.amount),
        categoryId: parseInt(categoryId || 0, 10),
    };

    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create income");
    return res.json();
}

export async function updateIncome(id, income) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(income),
    });
    if (!res.ok) throw new Error("Failed to update income");
    if (res.status === 204) return null;
    return res.json();
}

export async function deleteIncome(id) {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete income");
}
