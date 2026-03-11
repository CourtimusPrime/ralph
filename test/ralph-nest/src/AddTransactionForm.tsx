import { useEffect, useState } from "react";

type Category = { id: number; name: string; monthly_limit: number | null };

type Props = {
  onAdded: () => void;
};

export function AddTransactionForm({ onAdded }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(setCategories);
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!amount || isNaN(Number(amount))) e.amount = "Amount is required and must be a number";
    if (!date) e.date = "Date is required";
    if (!description.trim()) e.description = "Description is required";
    if (!categoryId) e.category = "Category is required";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setApiError(null);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        date,
        description,
        categoryId: Number(categoryId),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setApiError(data.error ?? "Failed to add transaction");
      return;
    }
    setAmount("");
    setDate(today);
    setDescription("");
    setCategoryId("");
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        {errors.amount && <span style={{ color: "red" }}>{errors.amount}</span>}
      </div>
      <div>
        <label>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        {errors.date && <span style={{ color: "red" }}>{errors.date}</span>}
      </div>
      <div>
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        {errors.description && <span style={{ color: "red" }}>{errors.description}</span>}
      </div>
      <div>
        <label>Category</label>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Select a category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.category && <span style={{ color: "red" }}>{errors.category}</span>}
      </div>
      {apiError && <p style={{ color: "red" }}>{apiError}</p>}
      <button type="submit">Add Transaction</button>
    </form>
  );
}
