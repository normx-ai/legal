/**
 * Middleware Auth + Tenant — NORMX Legal
 * 1. Valide le JWT Keycloak (JWKS)
 * 2. Verifie le role "legal" ou "admin"
 * 3. Cree/resout le schema tenant
 * 4. Auto-cree l'utilisateur dans le schema
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { createTenantSchema, ensureUserInSchema } from "../db/tenant.service";

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
  tenantSchema?: string;
}

interface KeycloakPayload {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: { roles: string[] };
  // Tenant info from Keycloak token or header
  tenant_slug?: string;
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
      req.userEmail = payload.email || payload.preferred_username || "";
      req.userName = payload.name || "";
      req.userRoles = payload.realm_access?.roles || [];

      // Note: la vérification d'accès sera gérée par le système d'abonnements
      // (pas par les rôles Keycloak)

      // Resoudre le tenant : utiliser le sub Keycloak comme slug de tenant
      // Chaque utilisateur Keycloak a son propre schema isole
      const tenantSlug = payload.sub.replace(/-/g, "_");
      const schema = await createTenantSchema(tenantSlug);
      req.tenantSchema = schema;

      // Auto-creer/resoudre l'utilisateur dans le schema
      const nameParts = (payload.name || "").split(" ");
      const userId = await ensureUserInSchema(
        schema,
        payload.sub,
        payload.email || payload.preferred_username || payload.sub,
        nameParts.slice(1).join(" ") || "",
        nameParts[0] || ""
      );
      req.userId = userId;

      next();
    } catch {
      return res.status(401).json({ error: "Token invalide ou expiré" });
    }
  };
}
