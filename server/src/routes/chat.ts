import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { chat } from "../services/rag/chat";

export const chatRoutes = Router();

// POST /api/chat
chatRoutes.post("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const { messages, forme_juridique, chapitre } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages requis" });
    }

    const result = await chat(messages, {
      formeJuridique: forme_juridique,
      chapitre,
    });

    res.json({
      response: result.response,
      sources: result.sources,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur du chat IA";
    console.error("[chat]", err);
    res.status(500).json({ error: message });
  }
});
