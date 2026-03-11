# Sub-PRD: Dashboard
## Part of: Personal Budget Tracker

## Introduction
Covers the dashboard view: a spending-by-category chart, a month-over-month totals chart, a category breakdown table with limit vs. actual, and over-budget alerts. All data comes from the aggregation queries defined in `prd-01-data-layer.md`. Charts use a lightweight library (Recharts or similar) compatible with React.

## User Stories

### US-013: Dashboard API routes
**Description:** As a developer, I want API routes that return aggregated spending data so that the dashboard can render charts and tables without doing any calculations client-side.

**Acceptance Criteria:**
- [ ] `GET /api/dashboard/spending-by-category?year=YYYY&month=MM` calls `getSpendingByCategory(year, month)` and returns the result
- [ ] `GET /api/dashboard/monthly-totals?months=N` calls `getMonthlyTotals(N)` (default N=6) and returns the result
- [ ] Both routes default to the current month/year when query params are omitted
- [ ] Responses include `{ data: [...] }`
- [ ] Typecheck/lint passes

### US-014: Spending by category chart
**Description:** As a user, I want a chart showing my spending per category for the current month so that I can see where my money is going.

**Acceptance Criteria:**
- [ ] Bar chart or pie chart rendered using Recharts (or equivalent React-compatible library)
- [ ] Each bar/slice represents one category's total spending for the selected month
- [ ] Month selector (previous/next arrows or a `<select>`) allows viewing other months
- [ ] Chart is hidden and "No spending this month" is shown when all totals are zero
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-015: Month-over-month totals chart
**Description:** As a user, I want a bar chart of my total spending per month over the last 6 months so that I can spot trends in my overall spending.

**Acceptance Criteria:**
- [ ] Bar chart shows one bar per calendar month, last 6 months, oldest on the left
- [ ] X-axis labels formatted as `MMM YYYY` (e.g., "Sep 2025")
- [ ] Y-axis shows dollar amounts
- [ ] Chart shows even when some months have zero spending (bar height 0)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-016: Category breakdown table with over-budget alerts
**Description:** As a user, I want a table showing each category's monthly limit vs. actual spending, with a visual alert when I've exceeded a limit, so that I can manage my budget in real time.

**Acceptance Criteria:**
- [ ] Table columns: Category, Monthly Limit, Spent This Month, Remaining (or Over)
- [ ] "Monthly Limit" shows "—" for categories with no limit set
- [ ] "Remaining" column: positive value shown in green; negative (over-budget) shown in red with a warning icon
- [ ] Rows where spending exceeds the limit display an over-budget alert banner or badge (e.g., "Over budget by $X.XX")
- [ ] A summary alert appears at the top of the dashboard if any category is over budget ("⚠ You are over budget in N categories")
- [ ] Table is sorted: over-budget categories first, then by name
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements
- FR-1: Dashboard is the default landing page (`/`)
- FR-2: All chart and table data fetched from the `/api/dashboard/*` routes — no direct DB calls from the frontend
- FR-3: Recharts (or equivalent) added as a dependency; chosen library must be compatible with React 18+ and Bun's bundler
- FR-4: Tailwind used for layout and table styling; chart colors from Tailwind's palette where possible
- FR-5: Dashboard auto-refreshes data when the user navigates to it (at minimum on mount)

## Non-Goals
- Transaction CRUD is handled in `prd-02-transactions.md`
- Category CRUD is handled in `prd-03-categories.md`
- No email or push notifications for over-budget — UI alerts only
- No CSV export, no date range beyond month-based filters
- No drill-down into individual transactions from the chart

## Dependencies
- Depends on: `prd-01-data-layer.md` — specifically `getSpendingByCategory` and `getMonthlyTotals`
- Depends on: `prd-03-categories.md` — categories must exist before limits can be shown
