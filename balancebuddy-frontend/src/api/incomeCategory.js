const BASE_URL = "/api/incomecategories";

export async function fetchIncomeCategories() {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
        let text;
        try {
            text = await res.text();
        } catch {
            text = null;
        }
        const error = new Error(
            text?.trim() || `Failed to fetch income categories. (${res.status})`
        );
        error.status = res.status;
        throw error;
    }
    return await res.json();
}

export async function createIncomeCategory(category) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) {
        let text;
        try {
            text = await res.text();
        } catch {
            text = null;
        }
        const error = new Error(
            text?.trim() || `Failed to create income category. (${res.status})`
        );
        error.status = res.status;
        throw error;
    }
    return await res.json();
}

export async function updateIncomeCategory(id, category) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) {
        let text;
        try {
            text = await res.text();
        } catch {
            text = null;
        }
        const error = new Error(
            text?.trim() || `Failed to update income category. (${res.status})`
        );
        error.status = res.status;
        throw error;
    }
}

export async function deleteIncomeCategory(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        let text;
        try {
            text = await res.text();
        } catch {
            text = null;
        }
        const error = new Error(
            text?.trim() || `Failed to delete income category. (${res.status})`
        );
        error.status = res.status;
        throw error;
    }
}
