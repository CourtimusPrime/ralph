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
  onDelete?: (id: number) => void;
};

export function TransactionList({ refreshKey, onDelete }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then(r => r.json())
      .then(setTransactions)
      .catch(() => setError("Failed to load transactions"));
  }, [refreshKey]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (transactions.length === 0) return <p>No transactions yet</p>;

  return (
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
              <button onClick={() => onDelete?.(t.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
