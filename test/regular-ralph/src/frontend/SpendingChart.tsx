import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Transaction {
  amount: number;
  category_name: string | null;
}

interface ChartEntry {
  name: string;
  amount: number;
}

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#f97316",
  "#14b8a6",
];

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function formatMonthTitle(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function SpendingChart() {
  const [data, setData] = useState<ChartEntry[]>([]);
  const month = getCurrentMonth();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/transactions?month=${month}`);
      const transactions: Transaction[] = await res.json();

      const spendMap = new Map<string, number>();
      for (const tx of transactions) {
        const name = tx.category_name ?? "Uncategorized";
        spendMap.set(name, (spendMap.get(name) ?? 0) + tx.amount);
      }

      const entries: ChartEntry[] = [];
      for (const [name, amount] of spendMap.entries()) {
        if (amount > 0) {
          entries.push({ name, amount });
        }
      }
      entries.sort((a, b) => b.amount - a.amount);
      setData(entries);
    }

    void load();
  }, [month]);

  const title = `Spending by Category — ${formatMonthTitle(month)}`;

  if (data.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">No spending this month.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12 }}
          />
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
          />
          <Bar dataKey="amount" name="Spent">
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
