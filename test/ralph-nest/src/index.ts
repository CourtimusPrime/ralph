import { serve } from "bun";
import index from "./index.html";
import {
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  getAllCategories,
} from "./db";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/categories": {
      async GET() {
        return Response.json(getAllCategories());
      },
    },

    "/api/transactions": {
      async GET() {
        return Response.json(getAllTransactions());
      },
      async POST(req) {
        let body: unknown;
        try {
          body = await req.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const { amount, date, description, categoryId } = body as Record<string, unknown>;
        if (typeof amount !== "number" || isNaN(amount)) {
          return Response.json({ error: "amount must be a number" }, { status: 400 });
        }
        if (typeof date !== "string" || !date) {
          return Response.json({ error: "date is required" }, { status: 400 });
        }
        if (typeof description !== "string" || !description) {
          return Response.json({ error: "description is required" }, { status: 400 });
        }
        if (typeof categoryId !== "number") {
          return Response.json({ error: "categoryId must be a number" }, { status: 400 });
        }
        try {
          const row = createTransaction(amount, date, description, categoryId);
          return Response.json(row, { status: 201 });
        } catch (err) {
          return Response.json({ error: String(err) }, { status: 400 });
        }
      },
    },

    "/api/transactions/:id": {
      async DELETE(req) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          return Response.json({ error: "Invalid id" }, { status: 400 });
        }
        deleteTransaction(id);
        return Response.json({ ok: true });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
