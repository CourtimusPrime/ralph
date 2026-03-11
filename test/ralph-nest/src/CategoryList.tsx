import { useEffect, useState } from "react";

type Category = { id: number; name: string; monthly_limit: number | null };

type Props = {
  refreshKey?: number;
  onEdit?: (category: Category) => void;
  onDeleted?: () => void;
};

export function CategoryList({ refreshKey, onEdit, onDeleted }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [usedIds, setUsedIds] = useState<Set<number>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/transactions").then(r => r.json()),
    ]).then(([cats, txns]) => {
      setCategories(cats);
      const ids = new Set<number>((txns as { category_id: number }[]).map(t => t.category_id));
      setUsedIds(ids);
    }).catch(() => setLoadError("Failed to load categories"));
  }, [refreshKey]);

  async function handleDelete(id: number) {
    setDeleteError(null);
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? "Failed to delete category");
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    onDeleted?.();
  }

  if (loadError) return <p style={{ color: "red" }}>{loadError}</p>;

  if (categories.length === 0) return <p>No categories yet</p>;

  return (
    <div>
      {deleteError && <p style={{ color: "red" }}>{deleteError}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Monthly Limit</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => {
            const hasTransactions = usedIds.has(c.id);
            return (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.monthly_limit !== null ? `$${c.monthly_limit.toFixed(2)}` : "No limit"}</td>
                <td>
                  <button onClick={() => onEdit?.(c)}>Edit</button>
                  {" "}
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={hasTransactions}
                    title={hasTransactions ? "Category has transactions" : undefined}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
