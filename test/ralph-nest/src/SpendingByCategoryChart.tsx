import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type SpendingByCategory = {
  categoryId: number;
  categoryName: string;
  monthlyLimit: number | null;
  total: number;
};

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export function SpendingByCategoryChart() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<SpendingByCategory[]>([]);

  useEffect(() => {
    fetch(`/api/dashboard/spending-by-category?year=${year}&month=${month}`)
      .then(r => r.json())
      .then((res: { data: SpendingByCategory[] }) => setData(res.data));
  }, [year, month]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
  const hasSpending = data.some(d => d.total > 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <button onClick={prevMonth}>&larr;</button>
        <strong>{monthLabel}</strong>
        <button onClick={nextMonth}>&rarr;</button>
      </div>
      {!hasSpending ? (
        <p>No spending this month</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
            <XAxis dataKey="categoryName" />
            <YAxis tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v) => typeof v === "number" ? `$${v.toFixed(2)}` : v} />
            <Bar dataKey="total">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
