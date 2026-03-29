import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import pool from "../db/pool";

export const userRoutes = Router();

userRoutes.get("/profile", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const result = await pool.query(
    `SELECT id, nom, prenom, email, telephone, role, created_at FROM "${s}".users WHERE id = $1`,
    [req.userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  const user = result.rows[0];
  res.json({
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      created_at: user.created_at,
    },
  });
});
