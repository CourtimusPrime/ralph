# Sub-PRD: CRUD UI
## Part of: Personal Budget Tracker

## Introduction

This file covers the interactive UI for managing categories and transactions: adding, editing, and deleting both entity types. It also implements the API route handlers that persist changes via the data layer established in `prd-01-data-layer.md`. The dashboard charts and alerts are out of scope here — those are in `prd-03-dashboard.md`.

## User Stories

### US-005: Category management UI — list, add, edit, delete
**Description:** As a user, I want to manage my spending categories so that I can organize transactions and set monthly limits.

**Acceptance Criteria:**
- [ ] A "Categories" view (page or modal section) lists all categories with name and monthly limit (shows "No limit" if null)
- [ ] "Add Category" form accepts: name (required), monthly limit (optional, numeric)
- [ ] Submitting the form calls `POST /api/categories` and refreshes the list
- [ ] Each row has an "Edit" button that opens an inline form pre-filled with current values
- [ ] Saving edits calls `PUT /api/categories/:id` and refreshes the list
- [ ] Each row has a "Delete" button with a confirmation prompt before calling `DELETE /api/categories/:id`
- [ ] On deletion, any transactions that had this category become uncategorized (handled by DB cascade — UI just refreshes)
- [ ] Form validation shows an error if name is empty
- [ ] Styled with Tailwind
- [ ] Verify in browser using dev-browser skill
- [ ] Typecheck/lint passes

---

### US-006: API handlers for categories
**Description:** As a developer, I want the category API routes wired to the data access layer so that all CRUD operations are persisted.

**Acceptance Criteria:**
- [ ] `GET /api/categories` → calls `getCategories()`, returns `200` with array
- [ ] `POST /api/categories` → parses `{ name, monthlyLimit? }` from JSON body, calls `createCategory(...)`, returns `201` with new row; returns `400` if name missing
- [ ] `PUT /api/categories/:id` → parses `{ name, monthlyLimit? }`, calls `updateCategory(...)`, returns `200` with updated row; returns `404` if not found
- [ ] `DELETE /api/categories/:id` → calls `deleteCategory(...)`, returns `204`
- [ ] All errors return JSON `{ error: string }`
- [ ] Typecheck/lint passes

---

### US-007: Transaction list UI — view and delete
**Description:** As a user, I want to see all my transactions in a list so that I can review and remove entries.

**Acceptance Criteria:**
- [ ] A "Transactions" view lists transactions ordered by date descending
- [ ] Each row shows: date, description, amount (formatted as currency), category name (or "Uncategorized")
- [ ] Each row has a "Delete" button with a confirmation prompt before calling `DELETE /api/transactions/:id`
- [ ] List refreshes after deletion
- [ ] Styled with Tailwind; amounts shown with 2 decimal places and a `$` prefix
- [ ] Verify in browser using dev-browser skill
- [ ] Typecheck/lint passes

---

### US-008: Add transaction form
**Description:** As a user, I want to add a new transaction with amount, date, description, and category so that my spending is tracked.

**Acceptance Criteria:**
- [ ] "Add Transaction" form accepts: amount (required, numeric), date (required, defaults to today), description (optional), category (optional dropdown populated from `GET /api/categories`)
- [ ] Submitting calls `POST /api/transactions` and clears the form, refreshing the transaction list
- [ ] Form validation: amount must be a positive number, date must be a valid date
- [ ] Category dropdown includes a blank "Uncategorized" option at top
- [ ] Styled with Tailwind
- [ ] Verify in browser using dev-browser skill
- [ ] Typecheck/lint passes

---

### US-009: API handlers for transactions
**Description:** As a developer, I want the transaction API routes wired to the data access layer so that all operations are persisted.

**Acceptance Criteria:**
- [ ] `GET /api/transactions` → accepts optional query params `categoryId` and `month`, calls `getTransactions(filters)`, returns `200` with array
- [ ] `POST /api/transactions` → parses `{ amount, date, description?, categoryId? }`, calls `createTransaction(...)`, returns `201` with new row; returns `400` if amount or date missing
- [ ] `DELETE /api/transactions/:id` → calls `deleteTransaction(...)`, returns `204`
- [ ] All errors return JSON `{ error: string }`
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-5: The React app is a single-page app with tab or nav-based routing between "Transactions", "Categories", and "Dashboard" views (no React Router — use simple state)
- FR-6: All data fetching uses the native `fetch` API; no external HTTP client libraries
- FR-7: Amount values are stored as positive numbers; the UI does not enforce expense vs. income distinction
- FR-8: Date values stored as `"YYYY-MM-DD"` strings

## Non-Goals

- Charts, over-budget alerts, and the dashboard breakdown table are in `prd-03-dashboard.md`
- Editing transactions is out of scope — delete and re-add is the intended workflow
- Multi-user support, authentication, and CSV export are out of scope

## Dependencies

- Depends on: `prd-01-data-layer.md` completing US-001 through US-004 (schema, data access functions, and API server must exist before handlers can be wired)
