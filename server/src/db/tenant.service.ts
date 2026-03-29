/**
 * Service Tenant — NORMX Legal
 * Gestion des schemas PostgreSQL par tenant
 */

import pool from "./pool";
import fs from "fs";
import path from "path";

const SCHEMA_TEMPLATE = fs.readFileSync(
  path.join(__dirname, "tenant-schema.sql"),
  "utf-8"
);

function validateSchemaName(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9_]/g, "_").substring(0, 63);
  if (!clean || !/^[a-z]/.test(clean)) {
    throw new Error(`Nom de schema invalide: ${name}`);
  }
  return `tenant_${clean}`;
}

export async function createTenantSchema(tenantSlug: string): Promise<string> {
  const schema = validateSchemaName(tenantSlug);

  // Verifier si le schema existe deja
  const exists = await pool.query(
    "SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1",
    [schema]
  );

  if (exists.rows.length > 0) {
    return schema;
  }

  // Creer le schema avec le template
  const sql = SCHEMA_TEMPLATE.replace(/\$\{schema\}/g, schema);
  await pool.query(sql);

  console.log(`[tenant] Schema "${schema}" cree`);
  return schema;
}

export async function ensureUserInSchema(
  schema: string,
  keycloakSub: string,
  email: string,
  nom: string,
  prenom: string
): Promise<number> {
  // Chercher l'utilisateur par keycloak_sub
  const existing = await pool.query(
    `SELECT id FROM "${schema}".users WHERE keycloak_sub = $1`,
    [keycloakSub]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  // Auto-creation
  const result = await pool.query(
    `INSERT INTO "${schema}".users (keycloak_sub, email, nom, prenom)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET keycloak_sub = $1
     RETURNING id`,
    [keycloakSub, email, nom, prenom]
  );

  console.log(`[tenant] User "${email}" cree dans schema "${schema}"`);
  return result.rows[0].id;
}

export { validateSchemaName };
