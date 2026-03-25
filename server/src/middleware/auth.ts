import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
  orgId?: number;
}

export function requireAuth() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;

      // Bearer token (mobile)
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }

      // Cookie (web)
      if (!token && req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        return res.status(401).json({ error: "Token manquant" });
      }

      const payload = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé" });
      }

      // Check token revocation
      if (user.tokenRevokedAt) {
        const tokenIat = (jwt.decode(token) as any)?.iat;
        if (tokenIat && tokenIat < Math.floor(user.tokenRevokedAt.getTime() / 1000)) {
          return res.status(401).json({ error: "Session révoquée" });
        }
      }

      req.userId = user.id;
      req.userEmail = user.email;

      // Organization from header
      const orgHeader = req.headers["x-organization-id"];
      if (orgHeader) {
        req.orgId = parseInt(orgHeader as string, 10);
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Token invalide" });
    }
  };
}
