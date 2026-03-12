---
name: ralph
description: "Convert PRDs to prd.json format for the Ralph autonomous agent system. Use when you have an existing PRD and need to convert it to Ralph's JSON format. Triggers on: convert this prd, turn this into ralph format, create prd.json from this, ralph json."
user-invocable: true
---

# Ralph PRD Converter

Converts existing PRDs to the prd.json format that Ralph uses for autonomous execution.

**Two modes:**
- `/ralph tasks/prd-[feature].md` — convert a single PRD file (normal mode)
- `/ralph --bus tasks/[feature-slug]/` — compile a folder of sub-PRD files into bus format

---

## Normal Mode

Takes a PRD (markdown file or text) and converts it to `scripts/ralph/prd.json`.

### Output Format

```json
{
  "project": "[Project Name]",
  "branchName": "ralph/[feature-name-kebab-case]",
  "description": "[Feature description from PRD title/intro]",
  "userStories": [
    {
      "id": "US-001",
      "title": "[Story title]",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### Story Size: The Number One Rule

**Each story must be completable in ONE Ralph iteration (one context window).**

Right-sized stories:
- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list

Too big (split these):
- "Build the entire dashboard" → schema, queries, UI components, filters
- "Add authentication" → schema, middleware, login UI, session handling
- "Refactor the API" → one story per endpoint or pattern

**Rule of thumb:** If you cannot describe the change in 2-3 sentences, it is too big.

### Story Ordering: Dependencies First

Stories execute in priority order. Earlier stories must not depend on later ones.

1. Schema/database changes (migrations)
2. Server actions / backend logic
3. UI components that use the backend
4. Dashboard/summary views that aggregate data

### Acceptance Criteria: Must Be Verifiable

Good (verifiable):
- "Add `status` column to tasks table with default 'pending'"
- "Filter dropdown has options: All, Active, Completed"
- "Typecheck passes"

Bad (vague):
- "Works correctly"
- "Good UX"

Always include as final criterion: `"Typecheck passes"`

For stories with testable logic: `"Tests pass"`

For UI stories: `"Verify in browser using dev-browser skill"`

### Conversion Rules

1. Each user story becomes one JSON entry
2. IDs: Sequential (US-001, US-002, etc.)
3. Priority: Based on dependency order, then document order
4. All stories: `passes: false` and empty `notes`
5. `branchName`: Derive from feature name, kebab-case, prefixed with `ralph/`
6. Always add "Typecheck passes" to every story's acceptance criteria

### Archiving Previous Runs

Before writing a new `prd.json`, check if one exists from a different feature:

1. Read the current `prd.json` if it exists
2. If `branchName` differs from the new feature's branch name:
   - Create `scripts/ralph/archive/YYYY-MM-DD-[old-branch]/`
   - Copy `prd.json` and `progress.txt` to the archive
   - If old `prd.json` was bus mode, also copy `scripts/ralph/busses/[old-slug]/`
   - Reset `progress.txt` with fresh header

### Normal Mode Checklist

- [ ] Previous run archived (if `prd.json` exists with different `branchName`)
- [ ] Each story completable in one iteration
- [ ] Stories ordered by dependency (schema → backend → UI)
- [ ] Every story has "Typecheck passes"
- [ ] UI stories have "Verify in browser using dev-browser skill"
- [ ] Acceptance criteria are verifiable (not vague)
- [ ] No story depends on a later story

---

## Bus Mode (`--bus`)

Compiles a folder of sub-PRD markdown files (produced by `/prd --bus`) into Ralph's bus format:
- One `scripts/ralph/busses/[slug]/prd-NN-[scope].json` per source file
- `scripts/ralph/prd.json` as a manifest pointing to the sub-files

**Usage:** `/ralph --bus tasks/budget-tracker`

### Output Files

Given argument `tasks/budget-tracker` (slug = `budget-tracker`):

| Source file | Write to |
|---|---|
| `tasks/budget-tracker/prd-01-data-layer.md` | `scripts/ralph/busses/budget-tracker/prd-01-data-layer.json` |
| `tasks/budget-tracker/prd-02-transactions-ui.md` | `scripts/ralph/busses/budget-tracker/prd-02-transactions-ui.json` |
| `tasks/budget-tracker/prd-03-dashboard.md` | `scripts/ralph/busses/budget-tracker/prd-03-dashboard.json` |

Pattern: `scripts/ralph/busses/[slug]/[source-filename-stem].json`

The slug is the folder's basename. Do NOT prepend the slug to the filename.

Also write: `scripts/ralph/prd.json` (manifest only — no `userStories` key)

### Steps

1. Read all `prd-NN-*.md` files in the folder, sorted alphabetically (= numeric order)
2. Extract user stories from each file
3. Namespace story IDs using the filename stem:
   - `prd-01-data-layer.md` → IDs `data-layer-001`, `data-layer-002`, ...
   - `prd-02-transactions-ui.md` → IDs `transactions-ui-001`, `transactions-ui-002`, ...
4. Assign globally unique `priority` values `1, 2, 3, ...` across all stories in file order
5. Infer top-level fields:
   - `project`: from `package.json` `name` field if present, otherwise infer from codebase name
   - `branchName`: `feature/[slug]` (e.g., `tasks/budget-tracker` → `feature/budget-tracker`)
   - `description`: compose from folder name and sub-PRD titles/introductions
6. Preserve `passes` status: match existing sub-file stories by ID — `passes: true` stories keep their status; new stories default to `false`
7. Create `scripts/ralph/busses/[slug]/` if it does not exist
8. Write each source file's stories to its sub-file
9. Write `scripts/ralph/prd.json` as manifest

### Output Formats

#### `scripts/ralph/prd.json` — manifest, no `userStories`

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

#### `scripts/ralph/busses/[slug]/prd-NN-[scope].json` — sub-file

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

`passes` lives in sub-files only — never written to `prd.json`.

### Archiving Previous Runs

Before writing, check if `scripts/ralph/prd.json` exists with a different `branchName`:

1. Read `scripts/ralph/prd.json` if it exists
2. If `branchName` differs:
   - Create `scripts/ralph/archive/YYYY-MM-DD-[old-branch]/`
   - Copy `prd.json` and `progress.txt` there
   - If the old `prd.json` was bus mode, also copy `scripts/ralph/busses/[old-slug]/`
   - Reset `progress.txt` with a fresh header

### Bus Mode Checklist

- [ ] Previous run archived if `prd.json` exists with a different `branchName`
- [ ] All `prd-NN-*.md` files read in filename order
- [ ] Story IDs namespaced by filename stem
- [ ] `passes` preserved from existing sub-files by ID match
- [ ] Sub-files written to `scripts/ralph/busses/[slug]/` (not to `scripts/ralph/` root)
- [ ] `prd.json` is manifest only (`busses` array, no `userStories`)
- [ ] Every story has "Typecheck passes"
- [ ] UI stories have "Verify in browser using dev-browser skill"
- [ ] No story depends on a later story
