import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";

import { prisma } from '../server';
export const conversationRoutes = Router();

// GET /api/conversations — Liste des conversations de l'utilisateur
conversationRoutes.get("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  const userId = req.userId as number;

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  res.json(conversations);
});

// POST /api/conversations — Créer une nouvelle conversation
conversationRoutes.post("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  const userId = req.userId as number;
  const { title } = req.body as { title?: string };

  const conversation = await prisma.conversation.create({
    data: {
      title: title || "Nouvelle conversation",
      userId,
    },
  });

  res.status(201).json(conversation);
});

// GET /api/conversations/:id — Récupérer une conversation avec ses messages
conversationRoutes.get("/:id", requireAuth(), async (req: AuthRequest, res: Response) => {
  const userId = req.userId as number;

  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id as string, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return res.status(404).json({ error: "Conversation introuvable" });
  }

  res.json(conversation);
});

// DELETE /api/conversations/:id — Supprimer une conversation
conversationRoutes.delete("/:id", requireAuth(), async (req: AuthRequest, res: Response) => {
  const userId = req.userId as number;

  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id as string, userId },
  });

  if (!conversation) {
    return res.status(404).json({ error: "Conversation introuvable" });
  }

  await prisma.conversation.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});
