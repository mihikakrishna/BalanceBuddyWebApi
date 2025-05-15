const BASE_URL = "/api/incomecategory";

export async function fetchCategories() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
}

export async function createIncomeCategory(category) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return await res.json();
}

export async function deleteIncomeCategory(id) {
    const res = await fetch(`/api/incomecategory/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete category");
}