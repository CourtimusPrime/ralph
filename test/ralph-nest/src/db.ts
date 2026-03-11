import { Database } from "bun:sqlite";

export const db = new Database("budget.db");

db.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    monthly_limit REAL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT
  )
`);

export type Category = {
  id: number;
  name: string;
  monthly_limit: number | null;
};

const stmtGetAllCategories = db.prepare<Category, []>(
  "SELECT id, name, monthly_limit FROM categories ORDER BY name"
);

const stmtGetCategoryById = db.prepare<Category, [number]>(
  "SELECT id, name, monthly_limit FROM categories WHERE id = ?"
);

const stmtInsertCategory = db.prepare<Category, [string, number | null]>(
  "INSERT INTO categories (name, monthly_limit) VALUES (?, ?) RETURNING id, name, monthly_limit"
);

const stmtUpdateCategory = db.prepare<Category, [string, number | null, number]>(
  "UPDATE categories SET name = ?, monthly_limit = ? WHERE id = ? RETURNING id, name, monthly_limit"
);

const stmtDeleteCategory = db.prepare<void, [number]>(
  "DELETE FROM categories WHERE id = ?"
);

const stmtCountTransactionsByCategory = db.prepare<{ count: number }, [number]>(
  "SELECT COUNT(*) as count FROM transactions WHERE category_id = ?"
);

export function getAllCategories(): Category[] {
  return stmtGetAllCategories.all();
}

export function getCategoryById(id: number): Category | null {
  return stmtGetCategoryById.get(id) ?? null;
}

export function createCategory(name: string, monthlyLimit?: number): Category {
  const row = stmtInsertCategory.get(name, monthlyLimit ?? null);
  if (!row) throw new Error("Failed to insert category");
  return row;
}

export function updateCategory(id: number, name: string, monthlyLimit?: number): Category {
  const row = stmtUpdateCategory.get(name, monthlyLimit ?? null, id);
  if (!row) throw new Error(`Category ${id} not found`);
  return row;
}

export function deleteCategory(id: number): void {
  const ref = stmtCountTransactionsByCategory.get(id);
  if (ref && ref.count > 0) {
    throw new Error(`Cannot delete category ${id}: ${ref.count} transaction(s) reference it`);
  }
  stmtDeleteCategory.run(id);
}
