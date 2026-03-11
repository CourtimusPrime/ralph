import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Transaction {
  amount: number;
  date: string;
}

interface ChartEntry {
  month: string;  // "YYYY-MM" for aggregation key
  label: string;  // "Mar" abbreviated label
  amount: number;
}

function getLast12Months(): ChartEntry[] {
  const now = new Date();
  const entries: ChartEntry[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const label = d.toLocaleString("en-US", { month: "short" });
    entries.push({ month: `${year}-${month}`, label, amount: 0 });
  }
  return entries;
}

export function MonthOverMonthChart() {
  const [data, setData] = useState<ChartEntry[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/transactions");
      const transactions: Transaction[] = await res.json();

      const entries = getLast12Months();
      const spendMap = new Map<string, number>(entries.map((e) => [e.month, 0]));

      for (const tx of transactions) {
        const monthKey = tx.date.slice(0, 7);
        if (spendMap.has(monthKey)) {
          spendMap.set(monthKey, (spendMap.get(monthKey) ?? 0) + tx.amount);
        }
      }

      const result = entries.map((e) => ({ ...e, amount: spendMap.get(e.month) ?? 0 }));
      setData(result);
    }

    void load();
  }, []);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Monthly Spending — Last 12 Months
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis
            tickFormatter={(v: number) =>
              `$${v.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
            }
          />
          <Tooltip
            formatter={(value) => {
              if (typeof value !== "number") return String(value);
              return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
            }}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="amount" name="Total Spent" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
