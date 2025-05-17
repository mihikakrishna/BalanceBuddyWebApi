export async function undo(type) {
    const res = await fetch(`/api/undo/undo/${type}`, { method: "POST" });
    if (res.status === 204) return false;
    if (!res.ok) throw new Error("Undo failed");
    return true;
}

export async function redo(type) {
    const res = await fetch(`/api/undo/redo/${type}`, { method: "POST" });
    if (res.status === 204) return false;
    if (!res.ok) throw new Error("Redo failed");
    return true;
}
