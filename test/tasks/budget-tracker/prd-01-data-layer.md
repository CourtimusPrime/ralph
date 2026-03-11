# Sub-PRD: Data Layer
## Part of: Personal Budget Tracker

## Introduction
This file covers the SQLite database schema, migrations, and all Bun.serve() API endpoints that the frontend depends on. It establishes the single source of truth for transactions, categories, and monthly limits. No UI is implemented here — only the data model and the HTTP API.

## User Stories

### US-001: Initialize database schema
**Description:** As a developer, I want a SQLite schema created on startup so that the app has the correct tables and constraints before any user interaction.

**Acceptance Criteria:**
- [ ] Running the server creates (or migrates) a `budget.db` file using `bun:sqlite`
- [ ] Tables created: `transactions`, `categories`, `monthly_limits`
- [ ] `transactions`: `id`, `amount` (real), `description` (text), `category_id` (fk), `date` (text ISO-8601), `created_at`
- [ ] `categories`: `id`, `name` (text unique), `color` (text hex), `created_at`
- [ ] `monthly_limits`: `id`, `category_id` (fk unique), `limit_amount` (real), `updated_at`
- [ ] Foreign keys enforced (`PRAGMA foreign_keys = ON`)
- [ ] Schema migration is idempotent (`CREATE TABLE IF NOT EXISTS`)
- [ ] Typecheck/lint passes

### US-002: Transactions API (CRUD)
**Description:** As a user, I want to create, list, and delete transactions via the API so that the frontend can manage spending records.

**Acceptance Criteria:**
- [ ] `GET /api/transactions` returns all transactions, newest first, with `category_name` and `category_color` joined
- [ ] `GET /api/transactions?month=YYYY-MM` filters by month
- [ ] `POST /api/transactions` accepts `{ amount, description, category_id, date }` and returns the created row
- [ ] `DELETE /api/transactions/:id` removes the transaction and returns `{ success: true }`
- [ ] 400 returned for missing required fields; 404 returned for unknown id
- [ ] All handlers implemented as routes in `Bun.serve()`
- [ ] Typecheck/lint passes

### US-003: Categories API (CRUD)
**Description:** As a user, I want to create, update, list, and delete categories via the API so that I can organize transactions.

**Acceptance Criteria:**
- [ ] `GET /api/categories` returns all categories, each including its current `monthly_limit` (null if unset)
- [ ] `POST /api/categories` accepts `{ name, color }` and returns the created row
- [ ] `PUT /api/categories/:id` accepts `{ name?, color? }` and returns the updated row
- [ ] `DELETE /api/categories/:id` removes the category (and its limit) — returns 409 if category has transactions
- [ ] Typecheck/lint passes

### US-004: Monthly limits API
**Description:** As a user, I want to set and update monthly spending limits per category via the API so that the frontend can display over-budget warnings.

**Acceptance Criteria:**
- [ ] `PUT /api/categories/:id/limit` accepts `{ limit_amount }` and upserts into `monthly_limits`
- [ ] `DELETE /api/categories/:id/limit` removes the limit for that category
- [ ] `GET /api/categories` (from US-003) already includes the limit — no separate GET endpoint needed
- [ ] Typecheck/lint passes

## Functional Requirements
- FR-1: All API responses use `Content-Type: application/json`
- FR-2: The server file is `server/index.ts`; the DB helper is `server/db.ts`
- FR-3: The database file path defaults to `./budget.db` (configurable via `DB_PATH` env var)
- FR-4: The server listens on port 3000 by default

## Non-Goals
- UI rendering, React components, and charts are handled in `prd-02-transactions-ui.md` and `prd-03-dashboard.md`
- No authentication or session management (single local user)
- No CSV import/export
- No recurring or scheduled transactions

## Dependencies
- None — this is the foundation all other files depend on
