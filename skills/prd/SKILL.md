---
name: prd
description: "Generate a Product Requirements Document (PRD) for a new feature. Use when planning a feature, starting a new project, or when asked to create a PRD. Triggers on: create a prd, write prd for, plan this feature, requirements for, spec out."
user-invocable: true
---

# PRD Generator

Create detailed Product Requirements Documents that are clear, actionable, and suitable for implementation.

**Two modes:**
- `/prd "feature description"` — single PRD file (normal mode)
- `/prd --bus "feature description"` — split into multiple scoped sub-PRD files (bus mode, for large features)

---

## Normal Mode

### The Job

1. Receive a feature description from the user
2. Ask 3-5 essential clarifying questions (with lettered options)
3. Generate a structured PRD based on answers
4. Save to `tasks/prd-[feature-name].md`

**Important:** Do NOT start implementing. Just create the PRD.

---

### Step 1: Clarifying Questions

Ask only critical questions where the initial prompt is ambiguous. Focus on:

- **Problem/Goal:** What problem does this solve?
- **Core Functionality:** What are the key actions?
- **Scope/Boundaries:** What should it NOT do?
- **Success Criteria:** How do we know it's done?

### Format Questions Like This:

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Other: [please specify]

2. Who is the target user?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the scope?
   A. Minimal viable version
   B. Full-featured implementation
   C. Just the backend/API
   D. Just the UI
```

This lets users respond with "1A, 2C, 3B" for quick iteration. Remember to indent the options.

---

### Step 2: PRD Structure

Generate the PRD with these sections:

#### 1. Introduction/Overview
Brief description of the feature and the problem it solves.

#### 2. Goals
Specific, measurable objectives (bullet list).

#### 3. User Stories
Each story needs:
- **Title:** Short descriptive name
- **Description:** "As a [user], I want [feature] so that [benefit]"
- **Acceptance Criteria:** Verifiable checklist of what "done" means

Each story should be small enough to implement in one focused session.

**Format:**
```markdown
### US-001: [Title]
**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**
- [ ] Specific verifiable criterion
- [ ] Another criterion
- [ ] Typecheck/lint passes
- [ ] **[UI stories only]** Verify in browser using dev-browser skill
```

**Important:**
- Acceptance criteria must be verifiable, not vague. "Works correctly" is bad. "Button shows confirmation dialog before deleting" is good.
- **For any story with UI changes:** Always include "Verify in browser using dev-browser skill" as acceptance criteria.

#### 4. Functional Requirements
Numbered list of specific functionalities.

#### 5. Non-Goals (Out of Scope)
What this feature will NOT include.

#### 6. Technical Considerations (Optional)
Known constraints, dependencies, integration points.

#### 7. Success Metrics
How will success be measured?

#### 8. Open Questions
Remaining questions or areas needing clarification.

---

### Output

- **Format:** Markdown (`.md`)
- **Location:** `tasks/`
- **Filename:** `tasks/prd-[feature-name].md` (kebab-case)

---

### Checklist

- [ ] Asked clarifying questions with lettered options
- [ ] Incorporated user's answers
- [ ] User stories are small and specific
- [ ] Functional requirements are numbered and unambiguous
- [ ] Non-goals section defines clear boundaries
- [ ] Saved to `tasks/prd-[feature-name].md`

---

## Bus Mode (`--bus`)

Use for large features where a single PRD would have too many stories (7+). Splits the feature into multiple focused sub-PRD files by domain, each covering one area.

### The Job

1. Parse the feature description and optional file count (`/prd --bus "description" N`)
2. Derive a `[feature-slug]` (kebab-case, e.g. `budget-tracker`)
3. Ask 3–5 clarifying questions (same style as normal mode)
4. Decide how to partition the feature into sub-domains
5. Present the proposed partition before writing (filename + one-line scope per file)
6. On confirmation (or if user says "go"), write all files

Without `N`: decide the number of files based on natural domain boundaries.
With `N`: produce exactly `N` files (must be 2–8).

### Propose the Partition First

Before writing, show the user what you plan:

```
I'll split this into 3 sub-PRD files in tasks/budget-tracker/:

  prd-01-data-layer.md     — Schema, storage, and data access
  prd-02-core-ui.md        — Main views and user interactions
  prd-03-reporting.md      — Charts, summaries, and export

Does this look right? (Reply to adjust, or say "go" to proceed)
```

### File Naming

```
tasks/[feature-slug]/prd-01-[scope].md
tasks/[feature-slug]/prd-02-[scope].md
tasks/[feature-slug]/prd-03-[scope].md
```

General ordering: **data before logic before UI before reporting.**

### Sub-PRD Structure

Each sub-PRD uses the same format as a normal PRD, scoped to its domain:

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
- [What is NOT in this file — name sibling files explicitly]

## Dependencies
- Depends on: [prd-01-foo.md completing X] (if applicable)
```

Key rules:
- Keep each file to **3–6 user stories**
- Non-Goals must name sibling files
- Stories ordered: schema → backend → UI within each file
- Every story must have "Typecheck/lint passes"
- UI stories must have "Verify in browser using dev-browser skill"

### Partition Heuristics

| Feature size | Suggested files |
|---|---|
| 4–6 stories total | 2 files |
| 7–12 stories total | 3 files |
| 13–18 stories total | 4–5 files |
| 18+ stories | Consider scoping down first |

Natural split boundaries:
- **Data layer** (schema, persistence) — almost always its own file
- **Core interactions** (CRUD, primary actions) — its own file
- **Reporting/analytics** (charts, export) — always its own file
- **Auth/permissions** — always its own file if present

### Output Summary

After writing all files, print:

```
Created 3 sub-PRD files in tasks/budget-tracker/:

  prd-01-data-layer.md         3 stories — schema and persistence
  prd-02-core-ui.md            4 stories — add/edit/delete transactions
  prd-03-reporting.md          3 stories — charts and export

Next steps:
  1. Review and edit the files in tasks/budget-tracker/
  2. Run: /ralph --bus tasks/budget-tracker   (compiles into scripts/ralph/prd.json)
  3. Run: ./scripts/ralph/ralph.sh
```

### Bus Mode Checklist

- [ ] Clarifying questions asked with lettered options
- [ ] Partition proposed and confirmed before writing
- [ ] Files written to `tasks/[feature-slug]/` (not `tasks/[feature-slug]/prd/`)
- [ ] Each sub-PRD has a "Non-Goals" section referencing sibling files
- [ ] Stories ordered data → logic → UI within each file
- [ ] Every story has "Typecheck/lint passes"
- [ ] UI stories have "Verify in browser using dev-browser skill"
- [ ] Summary table printed after writing
