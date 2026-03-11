# Sub-PRD: Data Layer
## Part of: Personal Budget Tracker

## Introduction
Establishes the SQLite database schema, migration strategy, and all data access functions for the budget tracker. This file is the foundation all other sub-PRDs depend on — no UI or server routes are included here, only the persistence layer and its TypeScript interfaces.

## User Stories

### US-001: Initialize database schema
**Description:** As a developer, I want the database to be created and migrated automatically on startup so that the app works out of the box with no manual setup.

**Acceptance Criteria:**
- [ ] `db.ts` creates (or opens) `budget.db` using `bun:sqlite`
- [ ] `categories` table: `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL UNIQUE`, `monthly_limit REAL` (nullable)
- [ ] `transactions` table: `id INTEGER PRIMARY KEY`, `amount REAL NOT NULL`, `date TEXT NOT NULL` (ISO 8601), `description TEXT NOT NULL`, `category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT`
- [ ] Migration runs with `IF NOT EXISTS` guards so re-running is safe
- [ ] Typecheck/lint passes

### US-002: Category data access functions
**Description:** As a developer, I want typed functions to create, read, update, and delete categories so that all category persistence is centralized.

**Acceptance Criteria:**
- [ ] `getAllCategories()` returns `Category[]` ordered by name
- [ ] `getCategoryById(id)` returns `Category | null`
- [ ] `createCategory(name, monthlyLimit?)` inserts and returns the new row
- [ ] `updateCategory(id, name, monthlyLimit?)` updates and returns the updated row
- [ ] `deleteCategory(id)` throws a descriptive error if any transactions reference it
- [ ] All functions use prepared statements
- [ ] TypeScript `Category` type exported from `db.ts`
- [ ] Typecheck/lint passes

### US-003: Transaction data access functions
**Description:** As a developer, I want typed functions to create, read, and delete transactions so that all transaction persistence is centralized.

**Acceptance Criteria:**
- [ ] `getAllTransactions()` returns `Transaction[]` ordered by date descending, with `categoryName` joined
- [ ] `getTransactionsByMonth(year, month)` returns transactions for that calendar month
- [ ] `createTransaction(amount, date, description, categoryId)` inserts and returns the new row
- [ ] `deleteTransaction(id)` removes the row
- [ ] TypeScript `Transaction` type (including `categoryName: string`) exported from `db.ts`
- [ ] All functions use prepared statements
- [ ] Typecheck/lint passes

### US-004: Spending aggregation queries
**Description:** As a developer, I want query functions that aggregate spending data so that the dashboard can display charts and limit comparisons without doing math in the UI layer.

**Acceptance Criteria:**
- [ ] `getSpendingByCategory(year, month)` returns `{ categoryId, categoryName, monthlyLimit, total }[]`
- [ ] `getMonthlyTotals(months?)` returns the last N calendar months (default 6) as `{ year, month, total }[]` ordered oldest-first
- [ ] Both functions use a single SQL query each (no N+1 loops)
- [ ] Return types exported from `db.ts`
- [ ] Typecheck/lint passes

## Functional Requirements
- FR-1: All database access goes through `db.ts` — no raw SQL elsewhere
- FR-2: Prepared statements used for all parameterized queries
- FR-3: `budget.db` file created in the project root (or configurable via `DB_PATH` env var)
- FR-4: All exported types are plain TypeScript interfaces (no ORM classes)

## Non-Goals
- API routes and HTTP handling are in `prd-02-transactions.md` and `prd-03-categories.md`
- UI components are in `prd-02-transactions.md`, `prd-03-categories.md`, and `prd-04-dashboard.md`
- No seed data or fixtures

## Dependencies
- None — this is the foundation layer
