import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { chat, ChatMessage } from "../services/rag/chat";

import { prisma } from '../server';
export const chatRoutes = Router();

interface ChatRequestBody {
  messages: ChatMessage[];
  forme_juridique?: string;
  chapitre?: string;
  conversationId?: string;
}

// POST /api/chat
chatRoutes.post("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  const userId = req.userId as number;
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
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (conversation) {
      const lastUserMsg = messages[messages.length - 1];
      await prisma.message.createMany({
        data: [
          { conversationId, role: lastUserMsg.role, content: lastUserMsg.content },
          { conversationId, role: "assistant", content: result.response, sources: result.sources },
        ],
      });

      // Titre auto sur le premier message
      const msgCount = await prisma.message.count({ where: { conversationId } });
      if (msgCount <= 2) {
        const title = lastUserMsg.content.substring(0, 80) + (lastUserMsg.content.length > 80 ? "..." : "");
        await prisma.conversation.update({ where: { id: conversationId }, data: { title } });
      } else {
        await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
      }
    }
  }

  res.json({
    response: result.response,
    sources: result.sources,
    conversationId,
  });
});
