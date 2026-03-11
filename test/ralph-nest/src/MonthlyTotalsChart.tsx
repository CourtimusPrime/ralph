import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type MonthlyTotal = { year: number; month: number; total: number };

type ChartEntry = { label: string; total: number };

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildFullMonths(months = 6): ChartEntry[] {
  const now = new Date();
  const result: ChartEntry[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, total: 0 });
  }
  return result;
}

export function MonthlyTotalsChart() {
  const [chartData, setChartData] = useState<ChartEntry[]>(buildFullMonths(6));

  useEffect(() => {
    fetch("/api/dashboard/monthly-totals?months=6")
      .then(r => r.json())
      .then((res: { data: MonthlyTotal[] }) => {
        const base = buildFullMonths(6);
        for (const entry of res.data) {
          const label = `${MONTH_NAMES[entry.month - 1]} ${entry.year}`;
          const idx = base.findIndex(b => b.label === label);
          const item = base[idx];
          if (idx !== -1 && item) item.total = entry.total;
        }
        setChartData(base);
      });
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
        <XAxis dataKey="label" />
        <YAxis tickFormatter={v => `$${v}`} />
        <Tooltip formatter={(v) => typeof v === "number" ? `$${v.toFixed(2)}` : v} />
        <Bar dataKey="total" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
