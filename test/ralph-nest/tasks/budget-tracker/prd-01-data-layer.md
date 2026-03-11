# Sub-PRD: Data Layer
## Part of: Personal Budget Tracker

## Introduction

This file covers everything beneath the UI: the SQLite database schema, the `bun:sqlite` data access layer, and the `Bun.serve()` HTTP server that routes API calls and serves the React frontend. Nothing is rendered here — all routes return JSON. The CRUD UI and dashboard are handled in sibling files.

## User Stories

### US-001: Initialize SQLite database with schema
**Description:** As a developer, I want the app to create and migrate the SQLite database on startup so that the schema is always current without manual setup.

**Acceptance Criteria:**
- [ ] On startup, `db.ts` opens (or creates) `budget.db` using `bun:sqlite`
- [ ] `categories` table is created with columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `name TEXT NOT NULL UNIQUE`, `monthly_limit REAL` (nullable)
- [ ] `transactions` table is created with columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `amount REAL NOT NULL`, `date TEXT NOT NULL` (ISO 8601), `description TEXT`, `category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL`
- [ ] Both tables use `CREATE TABLE IF NOT EXISTS` (idempotent)
- [ ] Typecheck/lint passes

---

### US-002: Data access functions for categories
**Description:** As a developer, I want typed CRUD functions for categories so that API handlers have a clean interface to the database.

**Acceptance Criteria:**
- [ ] `getCategories()` returns all categories ordered by name
- [ ] `getCategoryById(id)` returns a single category or `undefined`
- [ ] `createCategory(name, monthlyLimit?)` inserts and returns the new row
- [ ] `updateCategory(id, name, monthlyLimit?)` updates and returns the updated row (throws if not found)
- [ ] `deleteCategory(id)` deletes the row (no-op if not found)
- [ ] All functions are synchronous (bun:sqlite is sync)
- [ ] Types exported: `Category`, `NewCategory`
- [ ] Typecheck/lint passes

---

### US-003: Data access functions for transactions
**Description:** As a developer, I want typed CRUD functions for transactions so that API handlers have a clean interface to the database.

**Acceptance Criteria:**
- [ ] `getTransactions(filters?)` accepts optional `{ categoryId?, month? }` (month = `"YYYY-MM"`) and returns matching rows ordered by date descending
- [ ] `getTransactionById(id)` returns a single transaction or `undefined`
- [ ] `createTransaction(amount, date, description, categoryId?)` inserts and returns the new row
- [ ] `deleteTransaction(id)` deletes the row (no-op if not found)
- [ ] `getSpendingByCategory(month)` returns `{ categoryId, categoryName, total }[]` for the given month
- [ ] `getMonthlyTotals()` returns `{ month, total }[]` for the last 12 months, ordered ascending
- [ ] Types exported: `Transaction`, `NewTransaction`, `SpendingByCategory`, `MonthlyTotal`
- [ ] Typecheck/lint passes

---

### US-004: Bun.serve() API server with routes
**Description:** As a developer, I want a single `Bun.serve()` instance that handles all API routes and serves the frontend so that the app runs with `bun --hot src/index.ts`.

**Acceptance Criteria:**
- [ ] `src/index.ts` imports `./index.html` and mounts it on `GET /`
- [ ] API routes mounted:
  - `GET    /api/categories`
  - `POST   /api/categories`
  - `PUT    /api/categories/:id`
  - `DELETE /api/categories/:id`
  - `GET    /api/transactions`
  - `POST   /api/transactions`
  - `DELETE /api/transactions/:id`
  - `GET    /api/dashboard/spending-by-category?month=YYYY-MM`
  - `GET    /api/dashboard/monthly-totals`
- [ ] All API routes return `Content-Type: application/json`
- [ ] Unmatched routes return `404 { error: "Not found" }`
- [ ] `development: { hmr: true, console: true }` enabled
- [ ] Server logs the port on startup
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: Database file path is `./budget.db` relative to project root (configurable via `DB_PATH` env var)
- FR-2: All DB calls are synchronous; no async wrappers needed
- FR-3: `category_id` on transactions is nullable — deleting a category sets it to `NULL` (not a hard delete restriction)
- FR-4: The server must not use Express or any HTTP framework other than `Bun.serve()`

## Non-Goals

- React components and frontend rendering are in `prd-02-crud-ui.md`
- Charts and dashboard aggregation UI are in `prd-03-dashboard.md`
- Authentication, sessions, and multi-user support are out of scope entirely

## Dependencies

None — this is the foundation. `prd-02-crud-ui.md` and `prd-03-dashboard.md` both depend on this file completing first.
