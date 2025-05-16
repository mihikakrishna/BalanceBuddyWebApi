const BASE_URL = "/api/incomecategories";

export async function fetchCategories() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch income categories");
    return res.json();
}

export async function createIncomeCategory(category) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error("Failed to create income category");
    return res.json();
}

export async function deleteIncomeCategory(id) {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete income category");
}
