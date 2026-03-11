# Sub-PRD: Transactions
## Part of: Personal Budget Tracker

## Introduction
Covers the server routes and React UI for managing transactions. Users can view all transactions in a list, add a new transaction (with category selection), and delete an existing transaction. The server is built with `Bun.serve()` and HTML imports; the frontend uses React + Tailwind.

## User Stories

### US-005: Transaction API routes
**Description:** As a developer, I want REST API routes for transactions so that the React frontend can read, create, and delete transactions over HTTP.

**Acceptance Criteria:**
- [ ] `GET /api/transactions` returns all transactions (calls `getAllTransactions()`)
- [ ] `POST /api/transactions` accepts `{ amount, date, description, categoryId }`, validates input, calls `createTransaction()`, returns the new row
- [ ] `DELETE /api/transactions/:id` calls `deleteTransaction(id)`, returns `{ ok: true }`
- [ ] All routes return JSON; errors return `{ error: string }` with an appropriate status code
- [ ] `GET /api/categories` also implemented here (needed by the add-transaction form) — returns `getAllCategories()`
- [ ] Typecheck/lint passes

### US-006: Transaction list view
**Description:** As a user, I want to see all my transactions in a table so that I can review my spending history.

**Acceptance Criteria:**
- [ ] Table columns: Date, Description, Category, Amount
- [ ] Rows ordered date descending (newest first)
- [ ] Amount formatted as currency (e.g., `$12.50`)
- [ ] Date displayed as `YYYY-MM-DD`
- [ ] Empty state shown when there are no transactions ("No transactions yet")
- [ ] Each row has a Delete button
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-007: Add transaction form
**Description:** As a user, I want a form to add a new transaction so that I can record my spending.

**Acceptance Criteria:**
- [ ] Form fields: Amount (number input), Date (date picker, defaults to today), Description (text), Category (select dropdown populated from `GET /api/categories`)
- [ ] All fields required; inline validation errors shown on submit attempt
- [ ] On success, form resets and new transaction appears in the list without a full page reload
- [ ] On API error, error message shown inline
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-008: Delete transaction
**Description:** As a user, I want to delete a transaction so that I can remove entries I added by mistake.

**Acceptance Criteria:**
- [ ] Clicking Delete on a row calls `DELETE /api/transactions/:id`
- [ ] Row is removed from the list on success without a full page reload
- [ ] If the API call fails, an error message is shown and the row remains
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements
- FR-1: All API routes registered in `index.ts` using `Bun.serve()` route handlers
- FR-2: React state managed with `useState` / `useEffect` — no external state library
- FR-3: Tailwind used for all styling; no custom CSS files for this module
- FR-4: Amount stored and transmitted as a number (not string)

## Non-Goals
- Category CRUD UI is handled in `prd-03-categories.md`
- Dashboard charts and over-budget alerts are handled in `prd-04-dashboard.md`
- No transaction editing (only add and delete)
- No filtering or sorting controls

## Dependencies
- Depends on: `prd-01-data-layer.md` completing all data access functions before routes are wired up
