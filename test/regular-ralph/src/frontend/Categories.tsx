import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  monthly_limit: number | null;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [addName, setAddName] = useState("");
  const [addLimit, setAddLimit] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const [deleteError, setDeleteError] = useState<number | null>(null);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = (await res.json()) as Category[];
    setCategories(data);
  }

  useEffect(() => {
    void fetchCategories();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const body: { name: string; monthly_limit?: number } = { name: addName };
    if (addLimit !== "") body.monthly_limit = parseFloat(addLimit);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setAddName("");
    setAddLimit("");
    void fetchCategories();
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditLimit(cat.monthly_limit !== null ? String(cat.monthly_limit) : "");
    setDeleteError(null);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editId === null) return;
    const body: { name?: string; monthly_limit?: number | null } = {
      name: editName,
    };
    body.monthly_limit = editLimit !== "" ? parseFloat(editLimit) : null;
    await fetch(`/api/categories/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditId(null);
    void fetchCategories();
  }

  async function handleDelete(id: number) {
    setDeleteError(null);
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.status === 409) {
      setDeleteError(id);
    } else {
      void fetchCategories();
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>

      {/* Add form */}
      <form
        onSubmit={(e) => void handleAdd(e)}
        className="flex gap-3 mb-8 items-end"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="e.g. Groceries"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Limit ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={addLimit}
            onChange={(e) => setAddLimit(e.target.value)}
            placeholder="optional"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-36"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          Add Category
        </button>
      </form>

      {/* Category list */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Monthly Limit
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-100 last:border-0">
                {editId === cat.id ? (
                  <td colSpan={3} className="px-4 py-3">
                    <form
                      onSubmit={(e) => void handleEdit(e)}
                      className="flex gap-3 items-end"
                    >
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                        placeholder="no limit"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-36"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 text-gray-800">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {cat.monthly_limit !== null
                        ? `$${cat.monthly_limit.toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {deleteError === cat.id && (
                        <span className="text-red-600 text-xs mr-2">
                          Cannot delete: category has transactions
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(cat)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void handleDelete(cat.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No categories yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
