import { db } from "../db";

interface Transaction {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
}

export const transactionRoutes = {
  "/api/transactions": {
    GET(req: Request): Response {
      const url = new URL(req.url);
      const month = url.searchParams.get("month");

      if (month) {
        const rows = db.query<Transaction, [string]>(
          `SELECT t.id, t.amount, t.date, t.description, t.category_id, c.name AS category_name
           FROM transactions t
           LEFT JOIN categories c ON c.id = t.category_id
           WHERE t.date LIKE ?
           ORDER BY t.date DESC`
        ).all(`${month}%`);
        return Response.json(rows);
      }

      const rows = db.query<Transaction, []>(
        `SELECT t.id, t.amount, t.date, t.description, t.category_id, c.name AS category_name
         FROM transactions t
         LEFT JOIN categories c ON c.id = t.category_id
         ORDER BY t.date DESC`
      ).all();
      return Response.json(rows);
    },

    async POST(req: Request): Promise<Response> {
      const body = await req.json() as { amount?: unknown; date?: unknown; description?: unknown; category_id?: unknown };

      if (typeof body.amount !== "number" && typeof body.amount !== "string") {
        return Response.json({ error: "amount is required" }, { status: 400 });
      }
      const amount = Number(body.amount);
      if (isNaN(amount)) {
        return Response.json({ error: "amount must be a number" }, { status: 400 });
      }

      if (typeof body.date !== "string" || body.date.trim() === "") {
        return Response.json({ error: "date is required" }, { status: 400 });
      }
      const date = body.date.trim();

      const description = typeof body.description === "string" ? body.description : null;
      const category_id = (body.category_id !== undefined && body.category_id !== null)
        ? Number(body.category_id)
        : null;

      interface InsertedTransaction {
        id: number;
        amount: number;
        date: string;
        description: string | null;
        category_id: number | null;
      }

      const stmt = db.prepare<InsertedTransaction, [number, string, string | null, number | null]>(
        "INSERT INTO transactions (amount, date, description, category_id) VALUES (?, ?, ?, ?) RETURNING id, amount, date, description, category_id"
      );
      const row = stmt.get(amount, date, description, category_id);
      return Response.json(row, { status: 201 });
    },
  },

  "/api/transactions/:id": {
    DELETE(req: Request): Response {
      const id = parseInt((req as Request & { params: Record<string, string> }).params["id"] ?? "", 10);
      db.run("DELETE FROM transactions WHERE id = ?", [id]);
      return new Response(null, { status: 204 });
    },
  },
} as const;
