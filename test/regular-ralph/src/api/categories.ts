import { db } from "../db";

interface Category {
  id: number;
  name: string;
  monthly_limit: number | null;
}

export const categoryRoutes = {
  "/api/categories": {
    GET(_req: Request): Response {
      const rows = db.query<Category, []>("SELECT id, name, monthly_limit FROM categories ORDER BY name ASC").all();
      return Response.json(rows);
    },

    async POST(req: Request): Promise<Response> {
      const body = await req.json() as { name?: unknown; monthly_limit?: unknown };
      if (typeof body.name !== "string" || body.name.trim() === "") {
        return Response.json({ error: "name is required" }, { status: 400 });
      }
      const name = body.name.trim();
      const monthly_limit = (body.monthly_limit !== undefined && body.monthly_limit !== null)
        ? Number(body.monthly_limit)
        : null;

      const stmt = db.prepare<Category, [string, number | null]>(
        "INSERT INTO categories (name, monthly_limit) VALUES (?, ?) RETURNING id, name, monthly_limit"
      );
      const row = stmt.get(name, monthly_limit);
      return Response.json(row, { status: 201 });
    },
  },

  "/api/categories/:id": {
    async PUT(req: Request): Promise<Response> {
      const id = parseInt((req as Request & { params: Record<string, string> }).params["id"] ?? "", 10);
      const body = await req.json() as { name?: unknown; monthly_limit?: unknown };

      const existing = db.query<Category, [number]>(
        "SELECT id, name, monthly_limit FROM categories WHERE id = ?"
      ).get(id);
      if (!existing) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }

      const name = typeof body.name === "string" ? body.name.trim() : existing.name;
      const monthly_limit = (body.monthly_limit !== undefined)
        ? (body.monthly_limit === null ? null : Number(body.monthly_limit))
        : existing.monthly_limit;

      const stmt = db.prepare<Category, [string, number | null, number]>(
        "UPDATE categories SET name = ?, monthly_limit = ? WHERE id = ? RETURNING id, name, monthly_limit"
      );
      const row = stmt.get(name, monthly_limit, id);
      return Response.json(row, { status: 200 });
    },

    DELETE(req: Request): Response {
      const id = parseInt((req as Request & { params: Record<string, string> }).params["id"] ?? "", 10);

      const referenced = db.query<{ count: number }, [number]>(
        "SELECT COUNT(*) as count FROM transactions WHERE category_id = ?"
      ).get(id);
      if (referenced && referenced.count > 0) {
        return Response.json({ error: "Cannot delete: category has transactions" }, { status: 409 });
      }

      db.run("DELETE FROM categories WHERE id = ?", [id]);
      return new Response(null, { status: 204 });
    },
  },
} as const;
