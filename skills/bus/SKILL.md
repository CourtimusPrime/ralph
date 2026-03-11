---
name: bus
description: "Break a feature description into multiple scoped sub-PRD markdown files for use with Ralph's bus mode. Use when the user wants to split a large feature across multiple focused PRD files. Triggers on: /bus, bus prd, split into prds, break this into prds."
user-invocable: true
---

# Bus — Multi-PRD Generator

Break a feature description into multiple focused sub-PRD markdown files that work together as a bus set. Each file covers one domain of the feature. Files are later compiled into `scripts/ralph/prd.json` by running `/ralph-bus tasks/[feature-slug]`.

**This skill generates markdown planning files only. Do NOT implement anything.**

---

## Invocation Format

```
/bus "feature description"
/bus "feature description" N
```

- Without `N`: Claude decides the right number of files based on natural domain boundaries in the feature
- With `N`: Claude produces exactly `N` sub-PRD files (must be between 2 and 8)

---

## The Job

1. Parse the feature description and optional file count from the arguments
2. Derive a `[feature-slug]` from the feature name (kebab-case, e.g. `budget-tracker`)
3. Ask 3–5 clarifying questions (with lettered options) — same style as `/prd`
4. After answers, decide how to partition the feature into sub-domains
5. Present the proposed partition to the user before writing (show filename + one-line scope for each file)
6. On confirmation (or if user skips), write all files
7. Write each `tasks/[feature-slug]/prd-NN-[scope].md` sub-PRD

**Do NOT create `prd-master.json`.** Project metadata (project name, branchName, description) is inferred automatically by `/ralph-bus` when it reads the folder.

---

## Step 1: Clarifying Questions

Ask only what's needed to understand scope and boundaries. Focus on:

- What problem does this solve?
- Who is the primary user?
- What is explicitly out of scope?
- Any tech constraints or existing patterns to follow?

Format questions with lettered options so the user can reply "1A, 2C, 3B":

```
1. Question?
   A. Option
   B. Option
   C. Option

2. Question?
   A. Option
   B. Option
```

---

## Step 2: Propose the Partition

Before writing files, show the user what you plan to create:

```
I'll split this into 3 sub-PRD files in tasks/budget-tracker/:

  prd-01-data-layer.md     — Schema, storage, and data access
  prd-02-core-ui.md        — Main views and user interactions
  prd-03-reporting.md      — Charts, summaries, and export

Does this look right? (Reply to adjust, or say "go" to proceed)
```

If the user specified `N`, honor it exactly. If `N` would produce nonsensical splits (e.g., `N=7` for a 4-story feature), explain why and suggest a better number.

---

## Step 3: File Naming Convention

Each bus run gets its own subdirectory directly under `tasks/` named after the feature slug. Sub-PRD files use numeric prefixes to control merge order:

```
tasks/[feature-slug]/prd-01-[scope].md
tasks/[feature-slug]/prd-02-[scope].md
tasks/[feature-slug]/prd-03-[scope].md
```

The feature slug matches the branch name suffix (e.g., `budget-tracker` for branch `feature/budget-tracker`). The scope slug should be short, descriptive, and kebab-case (e.g., `data-layer`, `auth-flow`, `dashboard-ui`).

General ordering principle: **data before logic before UI before reporting.**

---

## Step 4: Write Each Sub-PRD

Each sub-PRD is a standard PRD markdown file scoped to its domain. Use the same structure as `/prd`:

```markdown
# Sub-PRD: [Scope Title]
## Part of: [Feature Name]

## Introduction
[What this file covers and why it's its own domain]

## User Stories

### US-001: [Title]
**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**
- [ ] Specific verifiable criterion
- [ ] Typecheck/lint passes
- [ ] **[UI stories only]** Verify in browser using dev-browser skill

## Functional Requirements
- FR-1: ...

## Non-Goals
- [What is NOT in this file — especially things handled by sibling files]

## Dependencies
- Depends on: [prd-01-foo.md completing X] (if applicable)
```

### Key rules for sub-PRDs:

- **Non-Goals must name sibling files** — e.g., "Chart rendering is handled in `prd-03-reporting.md`"
- **Dependencies section** — note any cross-file ordering requirements
- Keep each file to **3–6 user stories**. If a domain needs more, split it further.
- Stories within a file are ordered by dependency (schema before UI, always)
- Every story must have "Typecheck/lint passes" as final acceptance criterion
- UI stories must include "Verify in browser using dev-browser skill"

---

## Partition Heuristics

When deciding how to split (and Claude is choosing `N`):

| Feature size | Suggested files |
|---|---|
| 4–6 stories total | 2 files |
| 7–12 stories total | 3 files |
| 13–18 stories total | 4–5 files |
| 18+ stories total | Consider scoping down first |

Natural split boundaries:
- **Data layer** (schema, persistence, storage) — almost always its own file
- **Core interactions** (CRUD, primary user actions) — its own file
- **Views/display** (read-only UI, lists, detail views) — can merge with core or split
- **Reporting/analytics** (charts, summaries, export) — always its own file
- **Auth/permissions** — always its own file if present

---

## Output Summary

After writing all files, print a summary table:

```
Created 3 sub-PRD files in tasks/budget-tracker/:

  prd-01-data-layer.md         3 stories — schema and persistence
  prd-02-core-ui.md            4 stories — add/edit/delete transactions
  prd-03-reporting.md          3 stories — charts and export

Next steps:
  1. Review and edit the files in tasks/budget-tracker/
  2. Run: /ralph-bus tasks/budget-tracker   (compiles into scripts/ralph/prd.json)
  3. Run: ./scripts/ralph/ralph.sh
```

Each `/bus` run produces an isolated folder directly in `tasks/`, so multiple features can coexist without collisions. No `prd-master.json` is needed — `/ralph-bus` infers project metadata from the folder name and `package.json`.

---

## Checklist Before Saving

- [ ] Clarifying questions asked with lettered options
- [ ] Partition proposed and confirmed before writing
- [ ] Files written to `tasks/[feature-slug]/` (not `tasks/bus/[feature-slug]/`)
- [ ] No `prd-master.json` created (deprecated — `/ralph-bus` infers metadata)
- [ ] Each sub-PRD has a "Non-Goals" section that references sibling files
- [ ] Stories are ordered data → logic → UI within each file
- [ ] Every story has "Typecheck/lint passes"
- [ ] UI stories have "Verify in browser using dev-browser skill"
- [ ] Summary table printed after writing
