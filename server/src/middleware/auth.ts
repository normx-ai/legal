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
  userId?: string;
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

      req.userId = payload.sub;
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
