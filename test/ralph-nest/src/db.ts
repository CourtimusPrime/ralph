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

export type Transaction = {
  id: number;
  amount: number;
  date: string;
  description: string;
  category_id: number;
  categoryName: string;
};

const stmtGetAllTransactions = db.prepare<Transaction, []>(
  `SELECT t.id, t.amount, t.date, t.description, t.category_id, c.name AS categoryName
   FROM transactions t
   JOIN categories c ON c.id = t.category_id
   ORDER BY t.date DESC`
);

const stmtGetTransactionsByMonth = db.prepare<Transaction, [string, string]>(
  `SELECT t.id, t.amount, t.date, t.description, t.category_id, c.name AS categoryName
   FROM transactions t
   JOIN categories c ON c.id = t.category_id
   WHERE t.date >= ? AND t.date < ?
   ORDER BY t.date DESC`
);

const stmtInsertTransaction = db.prepare<Transaction, [number, string, string, number]>(
  `INSERT INTO transactions (amount, date, description, category_id) VALUES (?, ?, ?, ?)
   RETURNING id, amount, date, description, category_id,
     (SELECT name FROM categories WHERE id = category_id) AS categoryName`
);

const stmtDeleteTransaction = db.prepare<void, [number]>(
  "DELETE FROM transactions WHERE id = ?"
);

export function getAllTransactions(): Transaction[] {
  return stmtGetAllTransactions.all();
}

export function getTransactionsByMonth(year: number, month: number): Transaction[] {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return stmtGetTransactionsByMonth.all(start, end);
}

export function createTransaction(
  amount: number,
  date: string,
  description: string,
  categoryId: number
): Transaction {
  const row = stmtInsertTransaction.get(amount, date, description, categoryId);
  if (!row) throw new Error("Failed to insert transaction");
  return row;
}

export function deleteTransaction(id: number): void {
  stmtDeleteTransaction.run(id);
}
