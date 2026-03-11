# PRD: Personal Budget Tracker

## Introduction

A single-user, SQLite-backed personal budget tracker built with Bun, bun:sqlite, Bun.serve() with HTML imports, React, and Tailwind. Users manage transactions and categories, set optional monthly spending limits per category, and view dashboard analytics (spending by category, month-over-month totals, and a limit vs. actual breakdown table). An in-UI alert appears whenever spending in a category exceeds its limit for the current month.

## Goals

- Persist transactions (amount, date, description, category) in SQLite
- Allow full CRUD on categories with optional monthly spending limits
- Allow add/delete on transactions
- Detect and display over-budget status in the UI without any external notifications
- Render three dashboard visualisations: spending-by-category chart, month-over-month totals chart, and a category breakdown table

## File Partition

```
index.ts                                  # Bun.serve() entry, mounts all routes
db.ts                                     # SQLite init, schema, migrations, query helpers
api/
  transactions.ts                         # GET /api/transactions, POST, DELETE /:id
  categories.ts                           # GET /api/categories, POST, PUT /:id, DELETE /:id
index.html                                # HTML shell — imports frontend/App.tsx
frontend/
  App.tsx                                 # Root; tab navigation (Dashboard / Transactions / Categories)
  pages/
    Dashboard.tsx                         # Assembles charts + breakdown table + budget alerts
    Transactions.tsx                      # Transaction list + inline add/delete form
    Categories.tsx                        # Category list + add/edit/delete forms
  components/
    BudgetAlerts.tsx                      # Banner/badge list for over-budget categories
    SpendingChart.tsx                     # Bar or pie chart: spending per category (current month)
    MonthOverMonthChart.tsx               # Bar chart: total spending per month (last 6–12 months)
    CategoryBreakdownTable.tsx            # Table: category | limit | actual | over/under
```

## User Stories

### US-001: Database schema and migrations
**Description:** As a developer, I need the SQLite schema created on startup so the app can persist data immediately.

**Acceptance Criteria:**
- [ ] `db.ts` opens (or creates) `budget.db` using `bun:sqlite`
- [ ] `categories` table: `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL UNIQUE`, `monthly_limit REAL` (nullable)
- [ ] `transactions` table: `id INTEGER PRIMARY KEY`, `amount REAL NOT NULL`, `date TEXT NOT NULL` (ISO-8601), `description TEXT`, `category_id INTEGER REFERENCES categories(id)`
- [ ] Both tables created with `CREATE TABLE IF NOT EXISTS`
- [ ] Running `bun index.ts` twice does not error or drop data
- [ ] Typecheck passes

### US-002: Category API endpoints
**Description:** As a developer, I need REST endpoints for categories so the frontend can manage them.

**Acceptance Criteria:**
- [ ] `GET /api/categories` returns JSON array of all categories (`id`, `name`, `monthly_limit`)
- [ ] `POST /api/categories` with `{ name, monthly_limit? }` creates a category; returns `201` with the new row
- [ ] `PUT /api/categories/:id` with `{ name?, monthly_limit? }` updates a category; returns `200` with updated row
- [ ] `DELETE /api/categories/:id` deletes the category; returns `204`; fails with `409` if transactions reference it
- [ ] All handlers live in `api/categories.ts` and are imported in `index.ts`
- [ ] Typecheck passes

### US-003: Transaction API endpoints
**Description:** As a developer, I need REST endpoints for transactions so the frontend can list, add, and delete them.

**Acceptance Criteria:**
- [ ] `GET /api/transactions` returns JSON array ordered by `date DESC`; each item includes `id`, `amount`, `date`, `description`, `category_id`, `category_name`
- [ ] `GET /api/transactions?month=YYYY-MM` filters by month
- [ ] `POST /api/transactions` with `{ amount, date, description?, category_id }` creates a transaction; returns `201`
- [ ] `DELETE /api/transactions/:id` deletes a transaction; returns `204`
- [ ] All handlers live in `api/transactions.ts` and are imported in `index.ts`
- [ ] Typecheck passes

### US-004: App shell and navigation
**Description:** As a user, I want a persistent navigation bar so I can move between Dashboard, Transactions, and Categories.

**Acceptance Criteria:**
- [ ] `index.html` loads `frontend/App.tsx` via `<script type="module">`
- [ ] App renders a top nav with three tabs: Dashboard, Transactions, Categories
- [ ] Active tab is visually highlighted
- [ ] Switching tabs shows the correct page without a full page reload (client-side state)
- [ ] Tailwind is applied; layout is clean and readable
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Categories page — list, add, edit, delete
**Description:** As a user, I want to manage my spending categories so I can organise transactions and set limits.

**Acceptance Criteria:**
- [ ] Categories page lists all categories with their `name` and `monthly_limit` (shows "—" if none)
- [ ] Inline form to add a new category: name (required), monthly limit (optional number input)
- [ ] Edit button opens an inline edit form pre-filled with current values; Save updates the category via `PUT`
- [ ] Delete button removes the category via `DELETE`; if the API returns `409`, show an error message "Cannot delete: category has transactions"
- [ ] Category list refreshes after each create/update/delete without full page reload
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Transactions page — list, add, delete
**Description:** As a user, I want to log and remove transactions so I can track my spending.

**Acceptance Criteria:**
- [ ] Transactions page lists all transactions: date, description, amount, category name; ordered newest first
- [ ] Inline add form: amount (required, number), date (required, date picker defaulting to today), description (optional text), category (required dropdown populated from `/api/categories`)
- [ ] Submit adds the transaction via `POST`; row appears at top of list without reload
- [ ] Delete button on each row removes the transaction via `DELETE`; row disappears immediately
- [ ] Amounts are displayed formatted as currency (e.g. `$1,234.56`)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-007: Over-budget alert component
**Description:** As a user, I want a prominent alert when I've exceeded a category's monthly limit so I can adjust my spending.

**Acceptance Criteria:**
- [ ] `BudgetAlerts.tsx` accepts a list of `{ categoryName, limit, actual }` objects
- [ ] For each over-budget category, renders a visible alert (e.g. red banner or badge): "⚠ [Category]: $X.XX spent of $Y.YY limit"
- [ ] Component renders nothing if no categories are over budget
- [ ] Component is shown at the top of the Dashboard page
- [ ] Over-budget determination: sum of transaction amounts for the category in the current calendar month > `monthly_limit`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-008: Dashboard — spending by category chart
**Description:** As a user, I want to see how much I've spent by category this month so I can identify where my money is going.

**Acceptance Criteria:**
- [ ] `SpendingChart.tsx` renders a bar chart or pie chart (either acceptable) of total spending per category for the current calendar month
- [ ] Uses a charting library available via `bun install` (e.g. recharts); chart is labelled with category names and amounts
- [ ] Categories with zero spending are excluded from the chart
- [ ] Chart title reads "Spending by Category — [Month YYYY]"
- [ ] Chart data fetched from `/api/transactions?month=YYYY-MM`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-009: Dashboard — month-over-month totals chart
**Description:** As a user, I want to see my total monthly spending over the last 12 months so I can spot trends.

**Acceptance Criteria:**
- [ ] `MonthOverMonthChart.tsx` renders a bar chart of total spending per month for the last 12 calendar months (including current)
- [ ] X-axis is labelled with month abbreviations (e.g. "Mar", "Apr"); Y-axis shows dollar amounts
- [ ] Months with no transactions show a zero bar (not gaps)
- [ ] Chart title reads "Monthly Spending — Last 12 Months"
- [ ] Data computed from a single `GET /api/transactions` call (no new endpoint needed); aggregation done client-side
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-010: Dashboard — category breakdown table
**Description:** As a user, I want a table comparing each category's limit to actual spending so I can see my budget status at a glance.

**Acceptance Criteria:**
- [ ] `CategoryBreakdownTable.tsx` renders a table with columns: Category | Monthly Limit | Spent This Month | Remaining
- [ ] Limit shows "No limit" if `monthly_limit` is null
- [ ] Remaining = limit − spent; shows "—" if no limit; shown in red if negative
- [ ] Rows are sorted by category name A–Z
- [ ] Table is shown in the Dashboard below the charts
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: SQLite database file `budget.db` created on first run via `bun:sqlite`; schema initialised with `CREATE TABLE IF NOT EXISTS`
- FR-2: `categories` table stores `id`, `name` (unique), `monthly_limit` (nullable real)
- FR-3: `transactions` table stores `id`, `amount`, `date` (ISO-8601 string), `description`, `category_id` (FK)
- FR-4: All data access goes through `db.ts`; no raw SQL outside that file
- FR-5: API routes registered in `index.ts` using `Bun.serve({ routes })`; handlers imported from `api/`
- FR-6: Frontend served via HTML imports (`index.html` → `frontend/App.tsx`); Tailwind applied via CDN or PostCSS
- FR-7: Over-budget detection: sum of `amount` for a `category_id` where `date` starts with `YYYY-MM` (current month) > `monthly_limit`
- FR-8: Deleting a category that has associated transactions returns HTTP 409; UI shows an error message
- FR-9: Dashboard assembles `BudgetAlerts`, `SpendingChart`, `MonthOverMonthChart`, and `CategoryBreakdownTable` in a single page
- FR-10: All amounts formatted to two decimal places with `$` prefix in the UI

## Non-Goals

- No authentication or multi-user support
- No bank sync or external data import
- No CSV/PDF export
- No email or push notifications for over-budget events
- No mobile-specific layout or PWA features
- No recurring transaction automation
- No sub-categories or tags

## Technical Considerations

- Use `bun:sqlite` (`import { Database } from "bun:sqlite"`) — not `better-sqlite3`
- Use `Bun.serve({ routes })` — not Express
- HTML imports: `index.html` imports `frontend/App.tsx`; Bun bundles automatically
- Charting: install `recharts` via `bun install recharts` (React-native charting library)
- Tailwind: include via CDN `<script src="https://cdn.tailwindcss.com">` in `index.html` for simplicity
- All API responses use `Response` with `Content-Type: application/json`
- TypeScript strict mode; run `bun tsc --noEmit` for typecheck

## Success Metrics

- All CRUD operations complete without page reload
- Over-budget alert appears within the same render cycle that causes the budget to be exceeded
- Dashboard charts load in under 500 ms on a local machine with 1 000 transactions

## Open Questions

- Should deleting a category cascade-delete its transactions, or block the delete? (Current spec: block with 409)
- Should the spending-by-category chart default to bar or pie? (Current spec: either acceptable)
