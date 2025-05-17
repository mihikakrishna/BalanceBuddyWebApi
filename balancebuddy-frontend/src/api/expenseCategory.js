const BASE_URL = "/api/expensecategories";

export async function fetchExpenseCategories() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
}

export async function createExpenseCategory(category) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return await res.json();
}

export async function updateExpenseCategory(id, category) {
    const res = await fetch(`/api/expensecategories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", res.status, text);
        throw new Error("Failed to update category");
    }
}

export async function deleteExpenseCategory(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete category");
}
