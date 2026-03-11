import { useEffect, useState } from "react";
import { BudgetAlerts } from "./BudgetAlerts";
import { SpendingChart } from "./SpendingChart";

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

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function Dashboard() {
  const [overBudget, setOverBudget] = useState<OverBudgetEntry[]>([]);

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
    }

    void loadAlerts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
      <BudgetAlerts overBudget={overBudget} />
      <SpendingChart />
    </div>
  );
}
