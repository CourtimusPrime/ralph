# Sub-PRD: Dashboard & Reporting
## Part of: Personal Budget Tracker

## Introduction
This file covers the analytics dashboard: spending charts, category breakdowns, month-over-month summaries, and over-budget alerts. It consumes data from the API defined in `prd-01-data-layer.md` and is displayed alongside the transaction UI from `prd-02-transactions-ui.md`. No new API endpoints are added here — all data comes from existing endpoints.

## User Stories

### US-009: Spending by category chart
**Description:** As a user, I want to see a pie or donut chart of my spending by category for the selected month so that I can quickly understand where my money is going.

**Acceptance Criteria:**
- [ ] A `PieChart` (or `RadialBarChart`) from Recharts renders on the dashboard for the current month
- [ ] Each slice represents a category; slice color matches the category color
- [ ] Hovering a slice shows a tooltip with category name and total amount
- [ ] Chart updates when the month picker changes
- [ ] Empty state shown (no chart, explanatory message) when there are no transactions for the month
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-010: Category spending breakdown table
**Description:** As a user, I want a table showing each category's total spend, monthly limit, and percentage used for the selected month so that I can see detailed budget status at a glance.

**Acceptance Criteria:**
- [ ] Table columns: Category, Spent, Limit, % Used, Status
- [ ] "Status" column shows "On track", "Warning" (>80% of limit), or "Over budget" (>100%) with appropriate color coding (green/yellow/red)
- [ ] Rows with no limit show "—" in the Limit and % Used columns with a neutral status
- [ ] Table is sorted by "Spent" descending
- [ ] Table updates when the month picker changes
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-011: Over-budget alerts
**Description:** As a user, I want to see a prominent alert banner when any category exceeds its monthly limit so that I'm immediately aware when I've overspent.

**Acceptance Criteria:**
- [ ] An alert section appears at the top of the dashboard when one or more categories exceed 100% of their monthly limit for the current month
- [ ] Each alert names the category, shows the amount spent, the limit, and the overage (e.g., "Food: $320 spent, $250 limit — $70 over")
- [ ] Alerts are dismissible per-session (dismissed state stored in React state, not persisted)
- [ ] No alert section rendered if no categories are over budget
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-012: Month-over-month summary
**Description:** As a user, I want a bar chart comparing my total monthly spending across the last 6 months so that I can detect trends in my overall expenditure.

**Acceptance Criteria:**
- [ ] A `BarChart` from Recharts shows total spending per month for the trailing 6 months (including current)
- [ ] X-axis labels show abbreviated month names (e.g., "Oct", "Nov")
- [ ] Hovering a bar shows total spend for that month
- [ ] The current month's bar is visually distinct (different fill color or outline)
- [ ] Data is derived from `GET /api/transactions` results grouped client-side by month
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements
- FR-1: Recharts installed via `bun install recharts`
- FR-2: Dashboard is the default landing page (`page === "dashboard"` in client state)
- FR-3: The month picker used in the dashboard is the same component/state as in the transaction list (shared context or prop-drilled from a common parent)
- FR-4: All chart data is computed client-side from API responses — no new server endpoints required

## Non-Goals
- No CSV or image export of charts
- No multi-user or shared dashboards
- Transaction CRUD and category management are handled in `prd-02-transactions-ui.md`
- API endpoints and schema are handled in `prd-01-data-layer.md`

## Dependencies
- Depends on: `prd-01-data-layer.md` — requires `/api/transactions?month=YYYY-MM` and `/api/categories` (with limits)
- Depends on: `prd-02-transactions-ui.md` — the month picker component and shared layout must exist before the dashboard can integrate into the app shell
