# tasks/

This directory holds the source PRD files for **nested mode** — a preprocessing stage that merges multiple scoped `prd-*.json` files into a single flat `prd.json` before Ralph runs.

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
# Nest sub-PRDs into prd.json, then start Ralph
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


# TEST RESULTS

This test compared regular ol' Ralph to this version.

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

## Regular Ralph (after 30:51.92m)

- Commits: 94
- Diff: +1,432 lines across 19 files

# 5. Comparison

## 5.1 Speed & Output Volume

| Metric | Nest Mode | Regular Ralph | Winner |
|---|---|---|---|
| Build time | 24:27.7m | 30:51.9m | **Nest** (−6m 24s) |
| Commits | 77 | 94 | **Nest** (−17 commits) |
| Lines added | +1,122 | +1,432 | **Nest** (−310 lines) |
| Files changed | 18 | 19 | Tie |

Nest Mode completed the same feature set ~21% faster and produced ~22% less code while touching the same number of files. The reduction likely reflects more focused per-story context — each nest PRD covers a single domain (data layer, transactions, categories, dashboard), so the agent wasn't navigating a 16-story flat list on each iteration.

---

## 5.2 Architecture

Both apps are monolithic full-stack Bun apps with the same basic layers: SQLite → HTTP API → React frontend. The key structural difference is how each partitioned its concerns.

**Regular Ralph** split the API into a dedicated `api/` directory:
```
src/
├── index.ts       (25 LOC)   server entry
├── db.ts          (21 LOC)   schema init only
├── api/
│   ├── categories.ts  (72 LOC)
│   └── transactions.ts (82 LOC)
└── frontend/      (882 LOC across 8 components)
```

**Nest Mode** kept everything flatter, but pushed more logic into `db.ts`:
```
src/
├── index.ts       (155 LOC)  server + all routes
├── db.ts          (187 LOC)  schema + all query functions
└── [10 components] (653 LOC)
```

Regular Ralph's split better follows the Single Responsibility Principle — `index.ts` is purely a server/router, and API logic lives in focused handler files. Nest Mode's `index.ts` bloats to 155 lines by co-locating all routes, but compensates with a richer database layer that encapsulates all SQL behind typed functions.

**Winner: Regular Ralph** for API structure. **Nest Mode** for database encapsulation.

---

## 5.3 Database Layer

| Aspect | Nest Mode | Regular Ralph |
|---|---|---|
| Schema init | In `db.ts` | In `db.ts` |
| Query functions | 12 exported (typed prepared statements) | Inline in API handlers |
| Prepared statements | Pre-compiled at module load | `db.query()` called per-request |
| Aggregations | In `db.ts` via LEFT JOIN + COALESCE | Computed in frontend via `Map` |
| FK enforcement | `ON DELETE RESTRICT` | No `PRAGMA foreign_keys=ON` |
| Indexes | None | None |

Nest Mode's database layer is significantly stronger. Prepared statements are compiled once at startup, preventing per-request overhead. All SQL lives in one place — changes to a query don't require hunting through API handlers. Regular Ralph inlines queries in handlers and computes aggregations client-side with `Map`, which means more round-trips and duplicated logic.

Regular Ralph also has a FK enforcement gap: SQLite doesn't enforce foreign keys by default, and `PRAGMA foreign_keys=ON` is never set, so referential integrity is unenforced at the DB level.

**Winner: Nest Mode**

---

## 5.4 API Design

| Aspect | Nest Mode | Regular Ralph |
|---|---|---|
| Route coverage | GET/POST/PUT/DELETE (full CRUD) | GET/POST/PUT/DELETE (full CRUD) |
| HTTP status codes | 200/201/400/404 | 200/201/204/400/404/409 |
| Validation | Inline per-handler | Inline per-handler |
| Dashboard endpoints | Separate `/api/dashboard/*` routes | Aggregation done in frontend |
| Query params | `?year=&month=`, `?months=` | `?month=YYYY-MM` |

Regular Ralph has better HTTP semantics — it uses `204 No Content` for deletes and `409 Conflict` for duplicate category names, which are more precise than Nest Mode's blanket 200/400 responses.

However, Nest Mode provides two dedicated dashboard API endpoints (`/api/dashboard/spending-by-category` and `/api/dashboard/monthly-totals`) that pre-aggregate data server-side. Regular Ralph's dashboard fetches raw transactions and categories, then aggregates in the browser with `Map` — less efficient and harder to optimize later.

**Winner: Tie** — Regular Ralph on HTTP semantics, Nest Mode on data architecture.

---

## 5.5 Frontend

| Aspect | Nest Mode | Regular Ralph |
|---|---|---|
| Component count | 10 | 8 |
| Total frontend LOC | 653 | 882 |
| Avg LOC/component | 65 | 110 |
| Styling | Custom CSS (187 LOC dark theme) | Tailwind CDN |
| Navigation | Full-page layout (all panels) | Tab-based (Dashboard / Transactions / Categories) |
| State management | Refresh-key pattern | Manual re-fetch after mutations |
| Loading states | None | None |
| Parallel fetching | No | `Promise.all` in Dashboard |

Nest Mode's components are smaller and more focused (65 LOC average vs. 110). Regular Ralph combines form + list into single components (`Transactions.tsx` is 217 LOC, `Categories.tsx` is 216 LOC), which makes them harder to reuse and test.

Regular Ralph's tab navigation is the better UX choice — it keeps the interface uncluttered. Nest Mode's all-on-one-page layout renders everything simultaneously, including three dashboard charts, which is overwhelming on first load.

Regular Ralph's use of `Promise.all` for the Dashboard's parallel fetches is a solid pattern. Neither app adds loading states, which is a miss for both.

Both apps suffer from type definition duplication — `Category` and `Transaction` interfaces are re-declared in 3–5 component files each rather than exported from a shared types module.

**Winner: Nest Mode** on component design. **Regular Ralph** on UX/navigation. Tie on data-fetching patterns overall.

---

## 5.6 Styling

| Aspect | Nest Mode | Regular Ralph |
|---|---|---|
| Approach | Global CSS file (187 LOC) | Tailwind CSS (CDN) |
| Theme | Custom dark theme (`#242424`) | Tailwind default (light) |
| Responsiveness | Basic (max-width, centered) | Basic (max-w-5xl, responsive gaps) |
| Scoping | None (global) | Utility-class per element |

Regular Ralph's Tailwind approach is more maintainable at scale — class names are colocated with markup, there's no risk of global CSS bleed, and the utility system is self-documenting. The downside is using the CDN in production (browser-side JIT compilation, larger payload).

Nest Mode's handwritten dark theme looks more polished and intentional, but a 187-line global CSS file with no scoping is harder to maintain.

**Winner: Regular Ralph** for maintainability, **Nest Mode** for visual polish.

---

## 5.7 Code Quality Summary

| Dimension | Nest Mode | Regular Ralph |
|---|---|---|
| TypeScript strictness | `strict: true` | `strict: true` |
| Type duplication | High (4+ files re-declare core types) | Moderate (2–3 files) |
| Error handling | try-catch, 400/500 responses | try-catch, better status codes |
| Unused code | None | 3 legacy template files (~89 LOC) |
| DB query encapsulation | Strong (all in db.ts) | Weak (inline in handlers) |
| HTTP semantics | Basic | More correct (204, 409) |
| Frontend component size | Small (65 LOC avg) | Large (110 LOC avg) |
| Dashboard data model | Server-side (API endpoints) | Client-side (Map aggregation) |

Regular Ralph left three unused template files (`App.tsx`, `frontend.tsx`, `APITester.tsx`, ~89 LOC total) — artifacts of a flat story list where the agent lost track of what it had previously scaffolded. Nest Mode produced no dead code, likely because its scoped per-domain PRDs kept context tighter.

---

## 5.8 Overall Verdict

| Category | Nest Mode | Regular Ralph |
|---|---|---|
| Build speed | ✅ Faster | ❌ |
| Code volume | ✅ Less | ❌ |
| DB layer | ✅ Stronger | ❌ |
| API structure | ❌ | ✅ Better SRP |
| HTTP semantics | ❌ | ✅ More correct |
| Frontend quality | ✅ Smaller components | ❌ |
| UX/navigation | ❌ | ✅ Tabs |
| Dead code | ✅ None | ❌ Legacy files |
| Dashboard architecture | ✅ Server-side agg | ❌ Client-side agg |
| Styling approach | ❌ Global CSS | ✅ Tailwind |

**Nest Mode wins on output quality.** It built faster, produced less code, left no dead code, and made better architectural decisions around the database and dashboard layers. The smaller, more focused component sizes are also a sign of tighter context — the agent wasn't pattern-matching against a sprawling story list when writing each file.

**Regular Ralph wins on API structure and HTTP correctness.** The dedicated `api/` directory and proper use of `204`/`409` codes show the agent was applying standard conventions. Tailwind is also the better long-term styling choice.

The most telling difference is the dashboard: Nest Mode correctly pushed aggregation to the server (two dedicated API endpoints), while Regular Ralph computed it on the client. This is a meaningful technical call that affects future scalability, and Nest Mode got it right — likely because the `prd-04-dashboard.md` sub-PRD was precise enough to specify server-side aggregation without the noise of the other 12 stories.

---

# Summary

Yes, Nest Mode is better — but with caveats.

Nest Mode produced a better application in less time. The wins aren't marginal: the dashboard architecture decision alone (server-side vs. client-side aggregation) is the kind of thing a senior engineer would flag in code review. Smaller components, richer DB layer, no dead code. These are signals of tighter, more focused context per story.

The areas where Regular Ralph won (API structure, HTTP status codes, Tailwind) are real but relatively shallow. A `204` vs `200` on a delete is easy to add; redesigning the dashboard data model is not.

The caveat: this was a single test on a well-defined greenfield project. Nest Mode's advantage comes from scoped context per sub-PRD — that advantage grows with project complexity and likely shrinks for very small features where a single flat PRD is sufficient. It also adds friction: more steps before the agent starts building, which matters if you're iterating quickly.

**Nest Mode is better for anything non-trivial. Regular Ralph is fine for small, focused features.**
