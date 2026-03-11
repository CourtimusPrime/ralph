I ran an A/B test on **Nest Mode** for Ralph to compare it to using the regular version of Ralph.

# 1. Prompt

In two separate instances, I used the following prompt:

```markdown
Create a personal budget tracker — SQLite-backed, single user, no auth. Transactions have amount, date, description, and category. Users can add/delete transactions and add/edit/delete categories. Each category has a name and optional monthly spending limit. When spending in a category exceeds its limit, show an over-budget alert in the UI (no email). Dashboard shows: spending by category (bar or pie chart), month-over-month totals (bar chart), and a category breakdown table with limit vs. actual. Tech stack: Bun, bun:sqlite, Bun.serve() with HTML imports, React + Tailwind. No bank sync, no CSV export, no multi-user, no mobile. Skip clarifying questions and go straight to proposing the file partition.
```

And pased it as such:

```bash
# cd ralph-nest
/nest "<prompt>"

# cd regular-ralph
/prd "<prompt>"
```

# 2. Immediate output

## Regular Ralph
- Created `tasks/prd-budget-tracker.md` (198 lines)
- Told me:
  - Table breakdown of tasks (total 10)
  - "Let me know if you'd like any stories split further, reordered, or if you're ready to convert this to `prd.json` with `/ralph`"

## Ralph Nest

- Gave me a summary of what it'll do
- Asked me to change it or send "go"

I skipped reading it and just said "go".

- Created:
  - `tasks/budget-tracker/prd-01-data-layer.md` (198 lines)
  - `tasks/budget-tracker/prd-02-transactions.md` (67 lines)
  - `tasks/budget-tracker/prd-03-categories.md` (63 lines)
  - `tasks/budget-tracker/prd-04-dashboard.md` (70 lines)

- Told me:
  - A table breakdown of the four files created
  - Next steps including:
    1. Review and edit the files in `tasks/budget-tracker/`
    2. Run: `ralph tasks/budget-tracker` (compiles into `scripts/ralph/prd.json`)
    3. Run: `./scripts/ralph/ralph.sh`

# 3. Created prd's

## Regular Ralph

```bash
/ralph @tasks/prd-budget-tracker.md
```

## Nest Mode

```bash
/ralph @tasks/budget-tracker/
```