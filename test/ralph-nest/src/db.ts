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
