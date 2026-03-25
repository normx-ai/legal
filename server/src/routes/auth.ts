import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../server";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

export const authRoutes = Router();

// POST /auth/register
authRoutes.post("/register", async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, password, telephone, entrepriseNom, pays } = req.body;

    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { nom, prenom, email, password: hashedPassword, telephone },
    });

    // Create organization
    const slug = (entrepriseNom || `org-${user.id}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    const org = await prisma.organization.create({
      data: {
        name: entrepriseNom || `Organisation de ${prenom}`,
        slug,
        pays: pays || "242",
      },
    });

    await prisma.organizationMember.create({
      data: { userId: user.id, organizationId: org.id, role: "OWNER" },
    });

    await prisma.subscription.create({
      data: { organizationId: org.id, plan: "FREE", documentsPerMonth: 1 },
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const isWebClient = !req.headers["x-platform"];
    if (isWebClient) {
      res.cookie("accessToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
    }

    res.status(201).json({
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, entreprise_id: org.id, entreprise_nom: org.name, is_verified: false, created_at: user.createdAt.toISOString() },
      token: isWebClient ? undefined : token,
      refreshToken: isWebClient ? undefined : refreshToken,
    });
  } catch (err) {
    console.error("[auth/register]", err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// POST /auth/login
authRoutes.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ error: "Compte verrouillé temporairement" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          lockedUntil: user.failedLoginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : undefined,
        },
      });
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const token = generateAccessToken(tokenPayload, rememberMe);
    const refreshToken = generateRefreshToken(tokenPayload, rememberMe);

    const isWebClient = !req.headers["x-platform"];
    if (isWebClient) {
      const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000;
      res.cookie("accessToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge });
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 });
    }

    res.json({
      user: {
        id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, telephone: user.telephone,
        role: membership?.role || user.role,
        entreprise_id: membership?.organizationId,
        entreprise_nom: membership?.organization.name,
        is_verified: user.isEmailVerified,
        created_at: user.createdAt.toISOString(),
      },
      token: isWebClient ? undefined : token,
      refreshToken: isWebClient ? undefined : refreshToken,
    });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
});

// POST /auth/refresh-token
authRoutes.post("/refresh-token", async (req: Request, res: Response) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "Refresh token manquant" });
    }

    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    const newTokenPayload = { userId: user.id, email: user.email };
    const newToken = generateAccessToken(newTokenPayload);
    const newRefreshToken = generateRefreshToken(newTokenPayload);

    const isWebClient = !req.headers["x-platform"];
    if (isWebClient) {
      res.cookie("accessToken", newToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
    }

    res.json({ token: newToken, refreshToken: isWebClient ? undefined : newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: "Refresh token invalide" });
  }
});

// POST /auth/logout
authRoutes.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Déconnecté" });
});

// POST /auth/clear-session
authRoutes.post("/clear-session", (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("csrf-token");
  res.json({ message: "Session nettoyée" });
});
