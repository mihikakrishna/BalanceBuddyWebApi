export async function undo() {
    const res = await fetch("/api/undo/undo", {
        method: "POST",
    });
    if (!res.ok) throw new Error("Undo failed");
}

export async function redo() {
    const res = await fetch("/api/undo/redo", {
        method: "POST",
    });
    if (!res.ok) throw new Error("Redo failed");
}
