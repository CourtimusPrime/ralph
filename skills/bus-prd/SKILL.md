---
name: bus-prd
description: "Compile a bus folder of sub-PRD markdown files into Ralph's bus prd.json format. Use when you have a tasks/[slug]/ folder with prd-NN-*.md files. Triggers on: /bus-prd, compile bus, ralph bus, bus to prd."
user-invocable: true
---

# Bus PRD Compiler

Compiles a folder of sub-PRD markdown files into Ralph's bus format:
- One `scripts/ralph/busses/[slug]/prd-NN-[scope].json` per source file (each owns its stories)
- `scripts/ralph/prd.json` as a manifest pointing to the sub-files

**Usage:** `/bus-prd tasks/budget-tracker`

---

## Output Files

Given argument `tasks/budget-tracker` (slug = `budget-tracker`):

| Source file | Write to |
|---|---|
| `tasks/budget-tracker/prd-01-data-layer.md` | `scripts/ralph/busses/budget-tracker/prd-01-data-layer.json` |
| `tasks/budget-tracker/prd-02-transactions-ui.md` | `scripts/ralph/busses/budget-tracker/prd-02-transactions-ui.json` |
| `tasks/budget-tracker/prd-03-dashboard.md` | `scripts/ralph/busses/budget-tracker/prd-03-dashboard.json` |

Pattern: `scripts/ralph/busses/[slug]/[source-filename-stem].json`

The slug is the folder's basename. The filename is the source stem unchanged -- do NOT prepend the slug.

Also write: `scripts/ralph/prd.json` (manifest only -- no `userStories` key)

---

## Steps

1. Read all `prd-NN-*.md` files in the folder, sorted alphabetically (= numeric order)
2. Extract user stories from each file
3. Namespace story IDs using the filename stem:
   - `prd-01-data-layer.md` -> IDs `data-layer-001`, `data-layer-002`, ...
   - `prd-02-transactions-ui.md` -> IDs `transactions-ui-001`, `transactions-ui-002`, ...
4. Assign globally unique `priority` values `1, 2, 3, ...` across all stories in file order
5. Infer top-level fields:
   - `project`: from `package.json` `name` field if present, otherwise infer from codebase name
   - `branchName`: `feature/[slug]` (e.g., `tasks/budget-tracker` -> `feature/budget-tracker`)
   - `description`: compose from folder name and titles/introductions of the sub-PRD files
6. Preserve `passes` status: read any existing sub-files at the output paths and match by story ID -- stories already `passes: true` keep their status; new stories default to `false`
7. Create `scripts/ralph/busses/[slug]/` if it does not exist
8. Write each source file's stories to its sub-file (see Output Files table above)
9. Write `scripts/ralph/prd.json` as manifest (see formats below)

---

## Output Formats

### `scripts/ralph/prd.json` -- manifest, no `userStories`

```json
{
  "project": "PersonalBudgetTracker",
  "branchName": "feature/budget-tracker",
  "description": "...",
  "busses": [
    "busses/budget-tracker/prd-01-data-layer.json",
    "busses/budget-tracker/prd-02-transactions-ui.json",
    "busses/budget-tracker/prd-03-dashboard.json"
  ]
}
```

Paths in `busses` are relative to `scripts/ralph/`. Always start with `busses/`.

### `scripts/ralph/busses/[slug]/prd-NN-[scope].json` -- sub-file

```json
{
  "scope": "Data Layer",
  "source": "tasks/budget-tracker/prd-01-data-layer.md",
  "userStories": [
    {
      "id": "data-layer-001",
      "title": "...",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

`passes` lives in sub-files only -- never written to `prd.json`.

---

## Story Size: The Number One Rule

**Each story must be completable in ONE Ralph iteration (one context window).**

### Right-sized:
- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic

### Too big (split these):
- "Build the entire dashboard" -> schema, queries, UI components, filters
- "Add authentication" -> schema, middleware, login UI, session handling

**Rule of thumb:** If you cannot describe the change in 2-3 sentences, it is too big.

---

## Story Ordering: Dependencies First

Stories execute in priority order. Earlier stories must not depend on later ones.

1. Schema / database changes
2. Server actions / backend logic
3. UI components that use the backend
4. Dashboard / summary views

File order controls cross-domain ordering. Stories within a file follow their document order.

---

## Acceptance Criteria: Must Be Verifiable

**Good:** "Add status column: 'pending' | 'in_progress' | 'done' (default 'pending')"
**Bad:** "Works correctly"

Always include as the final criterion: "Typecheck passes"

For stories with testable logic: "Tests pass"

For UI stories: "Verify in browser using dev-browser skill"

---

## Archiving Previous Runs

Before writing, check if `scripts/ralph/prd.json` exists with a different `branchName`:

1. Read `scripts/ralph/prd.json` if it exists
2. If `branchName` differs:
   - Create `scripts/ralph/archive/YYYY-MM-DD-[old-branch]/`
   - Copy `prd.json` and `progress.txt` there
   - If the old `prd.json` was bus mode, also copy `scripts/ralph/busses/[old-slug]/` into the archive folder
   - Reset `progress.txt` with a fresh header

---

## Checklist Before Saving

- [ ] Previous run archived if `prd.json` exists with a different `branchName`
- [ ] All `prd-NN-*.md` files read in filename order
- [ ] Story IDs namespaced by filename stem
- [ ] `passes` preserved from existing sub-files by ID match
- [ ] Sub-files written to `scripts/ralph/busses/[slug]/` (not to `scripts/ralph/` root)
- [ ] `prd.json` is manifest only (`busses` array, no `userStories`)
- [ ] Every story has "Typecheck passes" as a criterion
- [ ] UI stories have "Verify in browser using dev-browser skill"
- [ ] No story depends on a later story
