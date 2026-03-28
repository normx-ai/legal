/**
 * Routes Auth — Stub minimal
 * Login/register/OTP/MFA/reset sont geres par Keycloak (auth.normx-ai.com)
 * Ces routes ne servent plus qu'a la compatibilite (clear-session, logout cookie)
 */

import { Router, Request, Response } from "express";

export const authRoutes = Router();

// POST /auth/logout — nettoyer les cookies residuels
authRoutes.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Deconnecte" });
});

// POST /auth/clear-session — nettoyer tous les cookies
authRoutes.post("/clear-session", (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("csrf-token");
  res.json({ message: "Session nettoyee" });
});
