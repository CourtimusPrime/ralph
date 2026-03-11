import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
}

interface Category {
  id: number;
  name: string;
  monthly_limit: number | null;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  async function fetchTransactions() {
    const res = await fetch("/api/transactions");
    const data = (await res.json()) as Transaction[];
    setTransactions(data);
  }

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = (await res.json()) as Category[];
    setCategories(data);
  }

  useEffect(() => {
    void fetchTransactions();
    void fetchCategories();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const body: {
      amount: number;
      date: string;
      description?: string;
      category_id: number;
    } = {
      amount: parseFloat(amount),
      date,
      category_id: parseInt(categoryId, 10),
    };
    if (description !== "") body.description = description;
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setAmount("");
    setDate(todayISO());
    setDescription("");
    setCategoryId("");
    void fetchTransactions();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    void fetchTransactions();
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Transactions</h2>

      {/* Add form */}
      <form
        onSubmit={(e) => void handleAdd(e)}
        className="flex flex-wrap gap-3 mb-8 items-end bg-white p-4 rounded-lg border border-gray-200"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-28"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="optional"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-44"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-44"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          Add Transaction
        </button>
      </form>

      {/* Transaction list */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Description
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Amount
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Category
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="px-4 py-3 text-gray-600">{tx.date}</td>
                <td className="px-4 py-3 text-gray-800">
                  {tx.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">
                  {formatAmount(tx.amount)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {tx.category_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => void handleDelete(tx.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  No transactions yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
