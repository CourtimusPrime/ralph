interface OverBudgetEntry {
  categoryName: string;
  limit: number;
  actual: number;
}

interface BudgetAlertsProps {
  overBudget: OverBudgetEntry[];
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function BudgetAlerts({ overBudget }: BudgetAlertsProps) {
  const alerts = overBudget.filter((e) => e.actual > e.limit);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((entry) => (
        <div
          key={entry.categoryName}
          className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-800 rounded-md px-4 py-3 text-sm font-medium"
        >
          ⚠ {entry.categoryName}: {formatCurrency(entry.actual)} spent of{" "}
          {formatCurrency(entry.limit)} limit
        </div>
      ))}
    </div>
  );
}
