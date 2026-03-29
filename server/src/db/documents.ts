/**
 * Helper — Créer un document dans le schema tenant
 */

import pool from "./pool";

interface CreateDocumentInput {
  tenantSchema: string;
  userId: number;
  type: string;
  denomination: string;
  formeJuridique: string;
  docxPath: string;
  data: Record<string, unknown>;
}

export async function createDocument(input: CreateDocumentInput) {
  const s = input.tenantSchema;
  const result = await pool.query(
    `INSERT INTO "${s}".documents (user_id, type, denomination, forme_juridique, docx_path, data)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, type, denomination, forme_juridique, docx_path, created_at`,
    [input.userId, input.type, input.denomination, input.formeJuridique, input.docxPath, JSON.stringify(input.data)]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    type: row.type,
    denomination: row.denomination,
    forme_juridique: row.forme_juridique,
    docx_path: row.docx_path,
    createdAt: row.created_at,
  };
}
