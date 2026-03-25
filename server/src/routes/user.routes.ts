import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../server";

export const userRoutes = Router();

userRoutes.get("/profile", requireAuth(), async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  res.json({
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: membership?.role || user.role,
      entreprise_id: membership?.organizationId,
      entreprise_nom: membership?.organization.name,
      is_verified: user.isEmailVerified,
      created_at: user.createdAt.toISOString(),
    },
  });
});
