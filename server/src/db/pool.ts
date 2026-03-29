/**
 * Pool PostgreSQL direct — NORMX Legal
 * Utilisé pour les queries multi-tenant avec schema explicite
 */

import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://normxlegal@localhost:5432/normxlegal";

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

export default pool;
