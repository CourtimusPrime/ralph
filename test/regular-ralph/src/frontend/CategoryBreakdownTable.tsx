interface CategoryRow {
  name: string;
  monthly_limit: number | null;
  spent: number;
}

interface Props {
  rows: CategoryRow[];
}

export function CategoryBreakdownTable({ rows }: Props) {
  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Category Budget Breakdown</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-left">
            <th className="px-4 py-2 border border-gray-200">Category</th>
            <th className="px-4 py-2 border border-gray-200">Monthly Limit</th>
            <th className="px-4 py-2 border border-gray-200">Spent This Month</th>
            <th className="px-4 py-2 border border-gray-200">Remaining</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const remaining =
              row.monthly_limit !== null ? row.monthly_limit - row.spent : null;
            return (
              <tr key={row.name} className="border-t border-gray-200">
                <td className="px-4 py-2 border border-gray-200">{row.name}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {row.monthly_limit !== null ? fmt(row.monthly_limit) : "No limit"}
                </td>
                <td className="px-4 py-2 border border-gray-200">{fmt(row.spent)}</td>
                <td
                  className={`px-4 py-2 border border-gray-200 ${
                    remaining !== null && remaining < 0 ? "text-red-600" : ""
                  }`}
                >
                  {remaining !== null ? fmt(remaining) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
