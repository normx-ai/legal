/**
 * Middleware Auth Keycloak — NORMX Legal
 * Validation JWT via JWKS (cles publiques Keycloak)
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "https://auth.normx-ai.com";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "normx";
const JWKS_URI = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;
const ISSUER = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;

const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  cacheMaxAge: 600000,
  rateLimit: true,
});

export interface AuthRequest extends Request {
  userId?: number;
  keycloakSub?: string;
  userEmail?: string;
  userName?: string;
  userRoles?: string[];
  orgId?: number;
}

interface KeycloakPayload {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: { roles: string[] };
}

function getSigningKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  if (!header.kid) { callback(new Error("JWT header missing kid")); return; }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) { callback(err); return; }
    callback(null, key?.getPublicKey());
  });
}

export function requireAuth() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return res.status(401).json({ error: "Token manquant" });
    }

    try {
      const payload = await new Promise<KeycloakPayload>((resolve, reject) => {
        jwt.verify(token!, getSigningKey, { issuer: ISSUER, algorithms: ["RS256"] }, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded as KeycloakPayload);
        });
      });

      req.keycloakSub = payload.sub;
      req.userRoles = payload.realm_access?.roles || [];

      // Verifier que l'user a le role "legal" ou "admin"
      const roles = payload.realm_access?.roles || [];
      if (!roles.includes("legal") && !roles.includes("admin")) {
        return res.status(403).json({
          error: "Acces refuse — abonnement Legal requis",
          requiredRole: "legal",
        });
      }

      // Lookup ou auto-creation du user Prisma depuis le keycloakSub
      const { prisma } = require("../server");
      try {
        let user = await prisma.user.findUnique({ where: { keycloakSub: payload.sub } });
        if (!user) {
          // Auto-creation : premier login Keycloak → creer le user en base
          const nameParts = (payload.name || "").split(" ");
          user = await prisma.user.upsert({
            where: { email: payload.email || payload.preferred_username || payload.sub },
            update: { keycloakSub: payload.sub },
            create: {
              keycloakSub: payload.sub,
              email: payload.email || payload.preferred_username || payload.sub,
              nom: nameParts.slice(1).join(" ") || "",
              prenom: nameParts[0] || "",
              isEmailVerified: true,
            },
          });
        }
        req.userId = user.id;
      } catch {
        // Fallback si DB inaccessible — continuer avec keycloakSub
        req.userId = 0;
      }
      req.userEmail = payload.email || payload.preferred_username || "";
      req.userName = payload.name || "";
      req.userRoles = payload.realm_access?.roles || [];

      const orgHeader = req.headers["x-organization-id"];
      if (orgHeader) {
        req.orgId = parseInt(orgHeader as string, 10);
      }

      next();
    } catch {
      return res.status(401).json({ error: "Token invalide ou expire" });
    }
  };
}
