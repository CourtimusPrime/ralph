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

## Regular Ralph (after 1:29m)
- Created `tasks/prd-budget-tracker.md` (199 lines, 10 total tasks)
- Told me:
  - Table breakdown of tasks (total 10)
  - "Let me know if you'd like any stories split further, reordered, or if you're ready to convert this to `prd.json` with `/ralph`"

## Ralph Nest (after 1:28m)

- Gave me a summary of what it'll do
- Asked me to change it or send "go"

I skipped reading it and just said "go".

- Created (4 tasks each, 16 total):
  - `tasks/budget-tracker/prd-01-data-layer.md` (67 lines)
  - `tasks/budget-tracker/prd-02-transactions.md` (68 lines)
  - `tasks/budget-tracker/prd-03-categories.md` (64 lines)
  - `tasks/budget-tracker/prd-04-dashboard.md` (71 lines)

- Told me:
  - A table breakdown of the four files created
  - Next steps including:
    1. Review and edit the files in `tasks/budget-tracker/`
    2. Run: `ralph-nest tasks/budget-tracker` (compiles into `scripts/ralph/prd.json`)
    3. Run: `./scripts/ralph/ralph.sh`

# 3. Created prd's

## Regular Ralph (after 53s)

```bash
/ralph @tasks/prd-budget-tracker.md
```

Created:
- Created `scripts/ralph/prd.json` (175 lines)
- Table of 10 tasks 

## Nest Mode (after 2:04m)

```bash
/ralph-nest @tasks/budget-tracker/
```

Created: 
- `scripts/ralph/prd.json` (12 lines)
- `scripts/ralph/nests/budget-tracker/prd-01-data-layer.json` (72 lines)
- `scripts/ralph/nests/budget-tracker/prd-02-transactions.json` (72 lines)
- `scripts/ralph/nests/budget-tracker/prd-03-categories.json` (70 lines)
- `scripts/ralph/nests/budget-tracker/prd-04-dashboard.json` (72 lines)

- A breakdown table of the 4 files created (file, num of stories, priorities order (e.g. 1-4, 5-8))
- "**Next step:** `./scripts/ralph/ralph.sh`


# 4. Outcome

## Nest Mode (after 24:27.7m)

- Commits: 77
- Diff: +1,122 lines across 18 files

## Regular Ralph (after 50.92 seconds)

- Start: 2026-03-11T13:40:10.937Z