---
name: ralph
description: "Convert PRDs to prd.json format for the Ralph autonomous agent system. Accepts a single markdown file or a nest folder path. Use when you have an existing PRD and need to convert it to Ralph's JSON format. Triggers on: convert this prd, turn this into ralph format, create prd.json from this, ralph json, /ralph."
user-invocable: true
---

# Ralph PRD Converter

Converts PRD content into `scripts/ralph/prd.json` for autonomous execution by Ralph.

Accepts two input modes:

- **File mode:** `/ralph path/to/prd.md` — single PRD markdown file
- **Folder mode:** `/ralph tasks/nest/budget-tracker` — a nest folder containing multiple `prd-NN-*.md` files

---

## File Mode

Read the markdown file, extract all user stories, and write `scripts/ralph/prd.json`.

- `branchName`: derive from feature name, kebab-case, prefixed with `feature/`
- `project`: read from `package.json` if present, otherwise infer from codebase name
- `description`: pull from the PRD's Introduction or title
- Story IDs: sequential (`US-001`, `US-002`, …)

---

## Folder Mode

When the argument is a directory (not a `.md` file), treat it as a nest folder.

### Steps

1. Read all `prd-NN-*.md` files in the folder, sorted by filename (alphabetical = numeric order)
2. Extract user stories from each file in order
3. Namespace story IDs using the filename stem:
   - `prd-01-data-layer.md` → IDs `data-layer-001`, `data-layer-002`, …
   - `prd-02-transactions-ui.md` → IDs `transactions-ui-001`, `transactions-ui-002`, …
4. Reassign global `priority` values `1, 2, 3, …` across all stories in merge order
5. Infer top-level fields:
   - `project`: read from `package.json` `name` field if present, otherwise use the folder's parent project name
   - `branchName`: derive from the folder's basename, prefixed with `feature/` (e.g., `tasks/nest/budget-tracker` → `feature/budget-tracker`)
   - `description`: compose from the folder name and the titles/introductions of the sub-PRD files
6. Preserve `passes` status from existing `scripts/ralph/prd.json` by matching namespaced story IDs — stories already marked `passes: true` keep their status; new stories default to `false`
7. Write the result to `scripts/ralph/prd.json`

### No prd-master.json needed

Folder mode does not require or read a `prd-master.json`. All metadata is inferred. If a `prd-master.json` exists in the folder it is silently ignored.

---

## Output Format

```json
{
  "project": "[Project Name]",
  "branchName": "feature/[feature-name]",
  "description": "[One sentence describing what this branch delivers]",
  "userStories": [
    {
      "id": "data-layer-001",
      "title": "[Story title]",
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

In file mode, IDs are sequential (`US-001`, `US-002`, …). In folder mode, IDs are namespaced by filename stem as shown above.

---

## Story Size: The Number One Rule

**Each story must be completable in ONE Ralph iteration (one context window).**

Ralph spawns a fresh instance per iteration with no memory of previous work. If a story is too big, it runs out of context before finishing.

### Right-sized stories:
- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list

### Too big (split these):
- "Build the entire dashboard" → split into: schema, queries, UI components, filters
- "Add authentication" → split into: schema, middleware, login UI, session handling

**Rule of thumb:** If you cannot describe the change in 2–3 sentences, it is too big.

---

## Story Ordering: Dependencies First

Stories execute in priority order. Earlier stories must not depend on later ones.

1. Schema / database changes
2. Server actions / backend logic
3. UI components that use the backend
4. Dashboard / summary views

In folder mode, file order controls cross-domain ordering. Stories within a file are ordered by their position in the file.

---

## Acceptance Criteria: Must Be Verifiable

Each criterion must be checkable, not vague.

**Good:** `"Add status column: 'pending' | 'in_progress' | 'done' (default 'pending')"`
**Bad:** `"Works correctly"`

Always include as the final criterion:
```
"Typecheck passes"
```

For stories with testable logic:
```
"Tests pass"
```

For UI stories:
```
"Verify in browser using dev-browser skill"
```

---

## Archiving Previous Runs

Before writing a new `prd.json`, check if one already exists with a different `branchName`:

1. Read `scripts/ralph/prd.json` if it exists
2. If `branchName` differs from the new feature's branch name:
   - Create `scripts/ralph/archive/YYYY-MM-DD-[old-branch]/`
   - Copy `prd.json` and `progress.txt` there
   - Reset `progress.txt` with a fresh header

---

## Checklist Before Saving

- [ ] **Previous run archived** if `prd.json` exists with a different `branchName`
- [ ] In folder mode: all `prd-NN-*.md` files read in filename order
- [ ] In folder mode: story IDs namespaced by filename stem
- [ ] In folder mode: `passes` preserved from existing `prd.json` by ID match
- [ ] Every story has "Typecheck passes" as a criterion
- [ ] UI stories have "Verify in browser using dev-browser skill"
- [ ] No story depends on a later story
- [ ] Written to `scripts/ralph/prd.json`
