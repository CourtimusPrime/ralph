# Sub-PRD: Dashboard & Alerts
## Part of: Personal Budget Tracker

## Introduction

This file covers the Dashboard view: a spending-by-category chart, a month-over-month totals chart, a category breakdown table (limit vs. actual), and inline over-budget alerts. All data comes from the aggregation endpoints established in `prd-01-data-layer.md`. The CRUD forms and transaction list are out of scope here — those are in `prd-02-crud-ui.md`.

## User Stories

### US-010: Spending by category chart
**Description:** As a user, I want to see how much I've spent in each category this month so that I can understand where my money is going.

**Acceptance Criteria:**
- [ ] Dashboard includes a bar chart (or pie chart) showing total spending per category for the currently selected month
- [ ] Month selector (default: current month) controls which month is displayed; changing it refreshes the chart
- [ ] Chart data fetched from `GET /api/dashboard/spending-by-category?month=YYYY-MM`
- [ ] Categories with $0 spending in the selected month are omitted from the chart
- [ ] Chart rendered using a lightweight library (e.g., `recharts`) — no D3 — or a custom SVG/canvas implementation if recharts is unavailable
- [ ] Chart is labeled with category names and dollar amounts
- [ ] Styled with Tailwind
- [ ] Verify in browser using dev-browser skill
- [ ] Typecheck/lint passes

---

### US-011: Month-over-month totals chart
**Description:** As a user, I want to see how my total spending has changed over the last 12 months so that I can spot trends.

**Acceptance Criteria:**
- [ ] Dashboard includes a bar chart showing total spending per month for the last 12 months
- [ ] Data fetched from `GET /api/dashboard/monthly-totals`
- [ ] X-axis shows month labels (e.g., "Jan 2025"), Y-axis shows dollar amounts
- [ ] Current month is visually distinct (different bar color or highlight)
- [ ] Styled with Tailwind
- [ ] Verify in browser using dev-browser skill
- [ ] Typecheck/lint passes

---

### US-012: Category breakdown table with limit vs. actual
**Description:** As a user, I want to see a table comparing my actual spending against each category's monthly limit so that I can quickly see which categories I'm over or under budget.

**Acceptance Criteria:**
- [ ] Dashboard includes a table with columns: Category, Limit, Spent, Remaining, Status
- [ ] "Limit" shows the monthly limit or "—" if none set
- [ ] "Spent" shows total spending in the selected month for that category
- [ ] "Remaining" shows `limit - spent` (blank if no limit)
- [ ] "Status" shows "Over budget" (red badge) if `spent > limit`, "On track" (green badge) otherwise; blank if no limit
- [ ] Table includes an "Uncategorized" row for transactions with no category
- [ ] Table updates when the month selector changes
- [ ] Data is derived from the same `GET /api/dashboard/spending-by-category` response combined with `GET /api/categories`
- [ ] Styled with Tailwind
- [ ] Verify in browser using dev-browser skill
- [ ] Typecheck/lint passes

---

### US-013: Over-budget alert banner
**Description:** As a user, I want to see a prominent alert when any category exceeds its monthly spending limit so that I'm aware of overspending without having to check the table.

**Acceptance Criteria:**
- [ ] When one or more categories have `spent > limit` in the current month, a dismissible alert banner appears at the top of the Dashboard
- [ ] Banner lists the over-budget categories by name with amounts, e.g. "Dining: $340 / $300 limit"
- [ ] Dismissing the banner hides it for the current session (no persistence needed — it re-appears on next page load)
- [ ] Alert is styled with a red/amber background using Tailwind
- [ ] Alert does NOT appear if no categories have limits set, or if none are exceeded
- [ ] Verify in browser using dev-browser skill
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-9: The month selector is a shared piece of state passed down to all three dashboard components (chart, chart, table)
- FR-10: Chart library must be installable via `bun add`; prefer `recharts` (already React-compatible)
- FR-11: All dashboard data is fetched client-side on mount and on month change; no server-side rendering
- FR-12: The over-budget check is purely client-side: compare spending totals from the API against category limits; no separate alert endpoint needed

## Non-Goals

- Email or push notifications for over-budget events are out of scope
- CSV export of dashboard data is out of scope
- Editing transactions or categories from the dashboard is handled in `prd-02-crud-ui.md`
- The `getSpendingByCategory` and `getMonthlyTotals` DB functions are defined in `prd-01-data-layer.md`

## Dependencies

- Depends on: `prd-01-data-layer.md` completing US-003 (`getSpendingByCategory`, `getMonthlyTotals`) and US-004 (dashboard API routes mounted on the server)
- Depends on: `prd-02-crud-ui.md` completing US-005 (categories exist in DB for the breakdown table to be meaningful) — not a hard code dependency, but run after for a realistic demo
