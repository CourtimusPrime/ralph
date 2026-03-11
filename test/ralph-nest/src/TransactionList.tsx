import { useEffect, useState } from "react";

type Transaction = {
  id: number;
  amount: number;
  date: string;
  description: string;
  category_id: number;
  categoryName: string;
};

type Props = {
  refreshKey?: number;
};

export function TransactionList({ refreshKey }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    fetch("/api/transactions")
      .then(r => r.json())
      .then(setTransactions)
      .catch(() => setLoadError("Failed to load transactions"));
  }, [refreshKey]);

  async function handleDelete(id: number) {
    setDeleteError(null);
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? "Failed to delete transaction");
      return;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  if (loadError) return <p style={{ color: "red" }}>{loadError}</p>;

  if (transactions.length === 0) return <p>No transactions yet</p>;

  return (
    <div>
      {deleteError && <p style={{ color: "red" }}>{deleteError}</p>}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.description}</td>
              <td>{t.categoryName}</td>
              <td>${t.amount.toFixed(2)}</td>
              <td>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
