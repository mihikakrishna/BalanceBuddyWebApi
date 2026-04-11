const BASE_URL = "/api/creditcards";

export async function fetchCreditCards() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch credit cards");
    return await res.json();
}

export async function createCreditCard(creditCard) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creditCard),
    });
    if (!res.ok) throw new Error("Failed to create credit card");
    return await res.json();
}

export async function deleteCreditCard(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete credit card");
}

export async function updateCreditCard(id, creditCard) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creditCard),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", res.status, text);
        throw new Error("Failed to update credit card");
    }

    if (res.status === 204) return;

    return await res.json();
}
