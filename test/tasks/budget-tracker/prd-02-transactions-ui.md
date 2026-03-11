# Sub-PRD: Transactions & Categories UI
## Part of: Personal Budget Tracker

## Introduction
This file covers all user-facing interactions for managing transactions and categories: adding and deleting transactions, adding and editing categories (name and color), and setting monthly spending limits per category. It builds on the API defined in `prd-01-data-layer.md`. Chart rendering and reporting are handled in `prd-03-dashboard.md`.

## User Stories

### US-005: Add and delete transactions
**Description:** As a user, I want to add a new transaction and delete existing ones so that my spending records stay accurate.

**Acceptance Criteria:**
- [ ] A form is visible on the main page with fields: amount (number), description (text), category (select), date (date input defaulting to today)
- [ ] Submitting the form calls `POST /api/transactions` and refreshes the transaction list without a full page reload
- [ ] Each transaction row has a delete button that calls `DELETE /api/transactions/:id` and removes the row from the list
- [ ] Validation: amount must be > 0 and category must be selected before submitting; inline error shown otherwise
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-006: Transaction list view
**Description:** As a user, I want to see a paginated list of my transactions filtered by month so that I can review recent spending.

**Acceptance Criteria:**
- [ ] Transactions are shown in a table with columns: Date, Description, Category (colored badge), Amount
- [ ] A month picker (default: current month) filters the list via `GET /api/transactions?month=YYYY-MM`
- [ ] List is sorted newest-first
- [ ] Empty state message shown when no transactions exist for the selected month
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-007: Add and edit categories
**Description:** As a user, I want to create new spending categories and edit their names and colors so that I can organize my transactions meaningfully.

**Acceptance Criteria:**
- [ ] A "Categories" page (or modal/panel) lists all categories with their name and color swatch
- [ ] An "Add category" form accepts name and a color picker (or hex input); calls `POST /api/categories`
- [ ] Each category row has an edit button that opens an inline form pre-filled with the current name and color; saving calls `PUT /api/categories/:id`
- [ ] Each category row has a delete button; if the category has transactions, a confirmation warning is shown; calls `DELETE /api/categories/:id`
- [ ] Category list refreshes after any add/edit/delete without full page reload
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-008: Set monthly spending limits
**Description:** As a user, I want to set a monthly spending limit on each category so that the app can warn me when I'm over budget.

**Acceptance Criteria:**
- [ ] Each category row in the Categories view has a "Set limit" input field showing the current limit (or placeholder "No limit")
- [ ] Typing a value and confirming calls `PUT /api/categories/:id/limit`
- [ ] A "Remove limit" button (visible when a limit exists) calls `DELETE /api/categories/:id/limit`
- [ ] Limit changes are reflected immediately in the UI without page reload
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements
- FR-1: The React app entry point is `client/main.tsx`; the HTML shell is `index.html` served by `Bun.serve()`
- FR-2: Client-side routing uses minimal state (e.g., a `page` state variable) — no router library required
- FR-3: Fetch calls target relative URLs (`/api/...`) so no base URL config is needed
- FR-4: Tailwind CSS used for styling (loaded via CDN in `index.html` or bundled if already in project)

## Non-Goals
- Spending charts and month-over-month summaries are handled in `prd-03-dashboard.md`
- Over-budget alert display logic is handled in `prd-03-dashboard.md`
- No CSV import/export
- No recurring transactions

## Dependencies
- Depends on: `prd-01-data-layer.md` — all API endpoints (`/api/transactions`, `/api/categories`, `/api/categories/:id/limit`) must exist before this UI can function
