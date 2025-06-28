const BASE_URL = "/api/expensecategories";

export async function fetchExpenseCategories() {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
        const text = await res.text();
        const error = new Error(text || "Failed to fetch categories");
        error.status = res.status;
        throw error;
    }
    return await res.json();
}

export async function createExpenseCategory(category) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) {
        const text = await res.text();
        const error = new Error(text || "Failed to create category");
        error.status = res.status;
        throw error;
    }
    return await res.json();
}

export async function updateExpenseCategory(id, category) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) {
        const text = await res.text();
        const error = new Error(text || "Failed to update category");
        error.status = res.status;
        throw error;
    }
}

export async function deleteExpenseCategory(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const text = await res.text();
        const error = new Error(text || "Failed to delete category");
        error.status = res.status;
        throw error;
    }
}
