Prompt: 

Personal budget tracker — SQLite-backed, single user, no auth. Transactions have amount, date, description, and category. Users can add/delete transactions and add/edit/delete categories. Each category has a name and optional monthly spending limit. When spending in a category exceeds its limit, show an over-budget alert in the UI (no email). Dashboard shows: spending by category (bar or pie chart), month-over-month totals (bar chart), and a category breakdown table with limit vs. actual. Tech stack: Bun, bun:sqlite, Bun.serve() with HTML imports, React + Tailwind. No bank sync, no CSV export, no multi-user, no mobile. Skip clarifying questions and go straight to proposing the file partition.


Inside the @ralph-nest/ folder, create this MVP: {pasted from above}