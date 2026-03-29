import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import pool from "../db/pool";

export const conversationRoutes = Router();

// GET /api/conversations
conversationRoutes.get("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const result = await pool.query(
    `SELECT c.id, c.title, c.created_at, c.updated_at,
            (SELECT content FROM "${s}".messages m WHERE m.conversation_id = c.id ORDER BY m.created_at ASC LIMIT 1) as first_message
     FROM "${s}".conversations c WHERE c.user_id = $1 ORDER BY c.updated_at DESC`,
    [req.userId]
  );
  res.json(result.rows);
});

// POST /api/conversations
conversationRoutes.post("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const { title } = req.body as { title?: string };
  const result = await pool.query(
    `INSERT INTO "${s}".conversations (user_id, title) VALUES ($1, $2) RETURNING *`,
    [req.userId, title || "Nouvelle conversation"]
  );
  res.status(201).json(result.rows[0]);
});

// GET /api/conversations/:id
conversationRoutes.get("/:id", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const conv = await pool.query(
    `SELECT * FROM "${s}".conversations WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.userId]
  );
  if (conv.rows.length === 0) {
    return res.status(404).json({ error: "Conversation introuvable" });
  }
  const messages = await pool.query(
    `SELECT * FROM "${s}".messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [req.params.id]
  );
  res.json({ ...conv.rows[0], messages: messages.rows });
});

// DELETE /api/conversations/:id
conversationRoutes.delete("/:id", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const conv = await pool.query(
    `SELECT id FROM "${s}".conversations WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.userId]
  );
  if (conv.rows.length === 0) {
    return res.status(404).json({ error: "Conversation introuvable" });
  }
  await pool.query(`DELETE FROM "${s}".conversations WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});
