import { useEffect, useState } from "react";
import { BudgetAlerts } from "./BudgetAlerts";
import { SpendingChart } from "./SpendingChart";
import { MonthOverMonthChart } from "./MonthOverMonthChart";
import { CategoryBreakdownTable } from "./CategoryBreakdownTable";

interface Category {
  id: number;
  name: string;
  monthly_limit: number | null;
}

interface Transaction {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
}

interface OverBudgetEntry {
  categoryName: string;
  limit: number;
  actual: number;
}

interface CategoryRow {
  name: string;
  monthly_limit: number | null;
  spent: number;
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function Dashboard() {
  const [overBudget, setOverBudget] = useState<OverBudgetEntry[]>([]);
  const [breakdownRows, setBreakdownRows] = useState<CategoryRow[]>([]);

  useEffect(() => {
    const month = getCurrentMonth();

    async function loadAlerts() {
      const [catRes, txRes] = await Promise.all([
        fetch("/api/categories"),
        fetch(`/api/transactions?month=${month}`),
      ]);
      const categories: Category[] = await catRes.json();
      const transactions: Transaction[] = await txRes.json();

      // Sum spending per category_id for current month
      const spendMap = new Map<number, number>();
      for (const tx of transactions) {
        if (tx.category_id !== null) {
          spendMap.set(tx.category_id, (spendMap.get(tx.category_id) ?? 0) + tx.amount);
        }
      }

      const alerts: OverBudgetEntry[] = [];
      for (const cat of categories) {
        if (cat.monthly_limit !== null) {
          const actual = spendMap.get(cat.id) ?? 0;
          if (actual > cat.monthly_limit) {
            alerts.push({ categoryName: cat.name, limit: cat.monthly_limit, actual });
          }
        }
      }

      setOverBudget(alerts);

      // Build category breakdown rows
      const rows: CategoryRow[] = categories.map((cat) => ({
        name: cat.name,
        monthly_limit: cat.monthly_limit,
        spent: spendMap.get(cat.id) ?? 0,
      }));
      setBreakdownRows(rows);
    }

    void loadAlerts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
      <BudgetAlerts overBudget={overBudget} />
      <SpendingChart />
      <MonthOverMonthChart />
      <CategoryBreakdownTable rows={breakdownRows} />
    </div>
  );
}
