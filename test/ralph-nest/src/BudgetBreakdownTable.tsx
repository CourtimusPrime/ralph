import { useEffect, useState } from "react";

type SpendingByCategory = {
  categoryId: number;
  categoryName: string;
  monthlyLimit: number | null;
  total: number;
};

export function BudgetBreakdownTable() {
  const now = new Date();
  const [data, setData] = useState<SpendingByCategory[]>([]);

  useEffect(() => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    fetch(`/api/dashboard/spending-by-category?year=${year}&month=${month}`)
      .then(r => r.json())
      .then((res: { data: SpendingByCategory[] }) => setData(res.data));
  }, []);

  const overBudgetRows = data.filter(
    d => d.monthlyLimit !== null && d.total > d.monthlyLimit
  );

  const sorted = [...data].sort((a, b) => {
    const aOver = a.monthlyLimit !== null && a.total > a.monthlyLimit ? 1 : 0;
    const bOver = b.monthlyLimit !== null && b.total > b.monthlyLimit ? 1 : 0;
    if (bOver !== aOver) return bOver - aOver;
    return a.categoryName.localeCompare(b.categoryName);
  });

  return (
    <div>
      {overBudgetRows.length > 0 && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ⚠ You are over budget in {overBudgetRows.length} {overBudgetRows.length === 1 ? "category" : "categories"}
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Monthly Limit</th>
            <th>Spent This Month</th>
            <th>Remaining</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => {
            const overBudget = row.monthlyLimit !== null && row.total > row.monthlyLimit;
            const remaining = row.monthlyLimit !== null ? row.monthlyLimit - row.total : null;
            return (
              <tr key={row.categoryId}>
                <td>
                  {row.categoryName}
                  {overBudget && (
                    <span style={{ color: "red", marginLeft: "8px" }}>
                      Over budget by ${(row.total - row.monthlyLimit!).toFixed(2)}
                    </span>
                  )}
                </td>
                <td>{row.monthlyLimit !== null ? `$${row.monthlyLimit.toFixed(2)}` : "\u2014"}</td>
                <td>${row.total.toFixed(2)}</td>
                <td>
                  {remaining !== null ? (
                    <span style={{ color: remaining >= 0 ? "green" : "red" }}>
                      {remaining >= 0 ? `$${remaining.toFixed(2)}` : `\u26a0 -$${Math.abs(remaining).toFixed(2)}`}
                    </span>
                  ) : "\u2014"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
