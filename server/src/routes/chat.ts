import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { chat, ChatMessage } from "../services/rag/chat";
import pool from "../db/pool";

export const chatRoutes = Router();

interface ChatRequestBody {
  messages: ChatMessage[];
  forme_juridique?: string;
  chapitre?: string;
  conversationId?: string;
}

// POST /api/chat
chatRoutes.post("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const { messages, forme_juridique, chapitre, conversationId } = req.body as ChatRequestBody;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages requis" });
  }

  const result = await chat(messages, {
    formeJuridique: forme_juridique,
    chapitre,
  });

  // Persister si conversationId fourni
  if (conversationId) {
    const conv = await pool.query(
      `SELECT id FROM "${s}".conversations WHERE id = $1 AND user_id = $2`,
      [conversationId, req.userId]
    );

    if (conv.rows.length > 0) {
      const lastUserMsg = messages[messages.length - 1];

      await pool.query(
        `INSERT INTO "${s}".messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
        [conversationId, lastUserMsg.role, lastUserMsg.content]
      );
      await pool.query(
        `INSERT INTO "${s}".messages (conversation_id, role, content, sources) VALUES ($1, $2, $3, $4)`,
        [conversationId, "assistant", result.response, JSON.stringify(result.sources)]
      );

      // Titre auto sur les premiers messages
      const countResult = await pool.query(
        `SELECT COUNT(*) as c FROM "${s}".messages WHERE conversation_id = $1`,
        [conversationId]
      );
      const msgCount = parseInt(countResult.rows[0].c);

      if (msgCount <= 2) {
        const title = lastUserMsg.content.substring(0, 80) + (lastUserMsg.content.length > 80 ? "..." : "");
        await pool.query(
          `UPDATE "${s}".conversations SET title = $1, updated_at = NOW() WHERE id = $2`,
          [title, conversationId]
        );
      } else {
        await pool.query(
          `UPDATE "${s}".conversations SET updated_at = NOW() WHERE id = $1`,
          [conversationId]
        );
      }
    }
  }

  res.json({
    response: result.response,
    sources: result.sources,
    conversationId,
  });
});
