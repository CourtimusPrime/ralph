import { useEffect, useState } from "react";

type Category = { id: number; name: string; monthly_limit: number | null };

type Props = {
  editing?: Category | null;
  onSaved: () => void;
  onCancel: () => void;
};

export function CategoryForm({ editing, onSaved, onCancel }: Props) {
  const [name, setName] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setMonthlyLimit(editing.monthly_limit !== null ? String(editing.monthly_limit) : "");
    } else {
      setName("");
      setMonthlyLimit("");
    }
    setApiError(null);
  }, [editing]);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!name.trim()) {
      setApiError("Name is required");
      return;
    }
    setApiError(null);
    const body = {
      name: name.trim(),
      monthlyLimit: monthlyLimit ? Number(monthlyLimit) : undefined,
    };
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.error ?? "Failed to save category";
      setApiError(msg.includes("UNIQUE") ? "Category name already exists" : msg);
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label>Monthly Limit (optional)</label>
        <input
          type="number"
          step="0.01"
          value={monthlyLimit}
          onChange={e => setMonthlyLimit(e.target.value)}
        />
      </div>
      {apiError && <p style={{ color: "red" }}>{apiError}</p>}
      <button type="submit">{editing ? "Save" : "Add Category"}</button>
      {" "}
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
