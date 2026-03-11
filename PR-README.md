# tasks/

This directory holds the source PRD files for the **compilation step** — a preprocessing stage that merges multiple scoped `prd-*.json` files into a single flat `prd.json` before Ralph runs.

Instead of maintaining one monolithic PRD, you can split user stories into focused sub-PRD files by feature area, then merge them on demand. The `merge-prds.sh` script handles discovery, namespacing, priority assignment, and preservation of completed work across re-merges.

## Required files

| File | Purpose |
|------|---------|
| `prd-master.json` | Project-level metadata (project name, branch, description) |
| `prd-*.json` | Sub-PRD files; each contains a `userStories` array |

`prd-master.json` is excluded from the story merge sweep — only files matching `prd-*.json` other than `prd-master.json` are merged.

## prd-master.json schema

```json
{
  "project": "My Project",
  "branchName": "feature/my-feature",
  "description": "A short description of what this branch delivers."
}
```

All three fields are required. They become the top-level fields of the generated `prd.json`.

## prd-*.json sub-PRD schema

```json
{
  "userStories": [
    {
      "id": "ignored-at-merge-time",
      "title": "Do the thing",
      "description": "As a user, I want to do the thing so that I get value.",
      "acceptanceCriteria": [
        "Criterion A is met",
        "Criterion B is met"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

Only `userStories` is required. The `id` and `priority` fields in sub-PRDs are **ignored** — the merge script replaces them entirely (see ID Namespacing below).

## ID Namespacing

Story IDs are derived from the sub-PRD filename at merge time. The `prd-` prefix and `.json` suffix are stripped to form the namespace prefix, then stories are numbered sequentially within that file.

**Example:**

| Filename | Story position | Generated ID |
|----------|---------------|--------------|
| `prd-query-optimization.json` | 1st story | `query-optimization-001` |
| `prd-query-optimization.json` | 2nd story | `query-optimization-002` |
| `prd-auth.json` | 1st story | `auth-001` |

IDs in the source files are overwritten — only the generated namespaced IDs appear in `prd.json`.

## Merge order

Sub-PRDs are merged in **case-insensitive alphabetical filename order**. Use numeric prefixes to control ordering:

```
tasks/prd-01-auth.json        → merged first
tasks/prd-02-dashboard.json   → merged second
tasks/prd-03-reports.json     → merged third
```

Global `priority` values are reassigned `1, 2, 3, ...` across all stories in merge order. Original priority values in sub-PRDs are ignored.

## passes preservation on re-merge

Re-running `merge-prds.sh` after Ralph has completed some stories does **not** reset completed work.

Before writing `prd.json`, the script reads the existing `prd.json` and records which story IDs have `passes: true`. After merging, each story's `passes` field is set to `true` only if that namespaced ID was already passing. New stories default to `passes: false`. Stories removed from sub-PRDs are dropped and not carried over.

The `prd.json` file is the source of truth for pass/fail status — `passes` values in sub-PRD source files are always overridden by this step.

## Standard usage

```bash
# Compile sub-PRDs into prd.json, then start Ralph
./merge-prds.sh && ./ralph.sh
```

## --dry-run flag

Preview the merged output without writing `prd.json`:

```bash
./merge-prds.sh --dry-run
```

**What happens:**
- All validation and merge logic runs normally
- The merged `prd.json` content is printed to **stdout**
- A summary line is printed to **stderr**: `[dry-run] Would merge N stories from M files`
- `prd.json` and all other files are **not modified**
- Exit code follows the same rules as a normal run (non-zero on validation error)

**Example output:**

```
$ ./merge-prds.sh --dry-run
{
  "project": "My Project",
  "branchName": "feature/my-feature",
  "description": "...",
  "userStories": [ ... ]
}
[dry-run] Would merge 5 stories from 2 files
```
