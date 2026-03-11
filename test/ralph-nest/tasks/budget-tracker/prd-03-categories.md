# Sub-PRD: Categories
## Part of: Personal Budget Tracker

## Introduction
Covers the server routes and React UI for managing spending categories. Users can create categories with an optional monthly spending limit, rename them, update their limits, and delete them (when no transactions are attached). This module is a prerequisite for the transaction add-form and the dashboard.

## User Stories

### US-009: Category API routes
**Description:** As a developer, I want REST API routes for categories so that the React frontend can create, update, and delete categories over HTTP.

**Acceptance Criteria:**
- [ ] `POST /api/categories` accepts `{ name, monthlyLimit? }`, validates input, calls `createCategory()`, returns the new row
- [ ] `PUT /api/categories/:id` accepts `{ name, monthlyLimit? }`, validates input, calls `updateCategory()`, returns the updated row
- [ ] `DELETE /api/categories/:id` calls `deleteCategory(id)`; if the category has transactions, returns `400 { error: "Category has transactions" }`; otherwise returns `{ ok: true }`
- [ ] All routes return JSON; errors return `{ error: string }` with an appropriate status code
- [ ] Typecheck/lint passes

### US-010: Category list view
**Description:** As a user, I want to see all my categories in a list so that I can understand what spending buckets I have.

**Acceptance Criteria:**
- [ ] List displays each category's name and monthly limit (or "No limit" if unset)
- [ ] Each row has Edit and Delete buttons
- [ ] Delete button is disabled (with tooltip "Category has transactions") if the category cannot be deleted
- [ ] Empty state shown when no categories exist ("No categories yet")
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-011: Add and edit category form
**Description:** As a user, I want to add a new category or edit an existing one so that I can organize my spending.

**Acceptance Criteria:**
- [ ] "Add Category" button opens an inline form (or modal) with Name and Monthly Limit fields
- [ ] Monthly Limit is optional; leaving it blank stores `null`
- [ ] Clicking Edit on a row populates the same form with existing values
- [ ] On save, list refreshes and form closes without a full page reload
- [ ] Name uniqueness error from the API is shown inline ("Category name already exists")
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-012: Delete category
**Description:** As a user, I want to delete a category so that I can remove unused spending buckets.

**Acceptance Criteria:**
- [ ] Clicking Delete calls `DELETE /api/categories/:id`
- [ ] On success, category is removed from the list without a full page reload
- [ ] If the API returns 400 (has transactions), an error message is shown inline
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements
- FR-1: Monthly limit stored as a positive number or `null`; the UI should reject negative or zero values
- FR-2: Category name must be non-empty and trimmed before submission
- FR-3: Tailwind used for all styling

## Non-Goals
- Transaction CRUD is handled in `prd-02-transactions.md`
- Spending totals and limit comparison UI are handled in `prd-04-dashboard.md`
- No bulk import or reorder of categories

## Dependencies
- Depends on: `prd-01-data-layer.md` — specifically `createCategory`, `updateCategory`, `deleteCategory`
