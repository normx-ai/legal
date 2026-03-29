import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../middleware/auth";
import pool from "../db/pool";

export const documentsRoutes = Router();

// GET /documents
documentsRoutes.get("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const result = await pool.query(
    `SELECT id, type, denomination, forme_juridique, docx_path, pdf_path, data, created_at
     FROM "${s}".documents WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.userId]
  );

  res.json({
    documents: result.rows.map((d) => ({
      id: d.id,
      type: d.type,
      denomination: d.denomination,
      forme_juridique: d.forme_juridique,
      docx_url: d.docx_path ? `/files/${path.basename(d.docx_path)}` : null,
      pdf_url: d.pdf_path ? `/files/${path.basename(d.pdf_path)}` : null,
      created_at: d.created_at,
    })),
  });
});

// GET /documents/:id
documentsRoutes.get("/:id", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const result = await pool.query(
    `SELECT * FROM "${s}".documents WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Document non trouvé" });
  }

  const d = result.rows[0];
  res.json({
    document: {
      id: d.id,
      type: d.type,
      denomination: d.denomination,
      forme_juridique: d.forme_juridique,
      data: d.data,
      docx_url: d.docx_path ? `/files/${path.basename(d.docx_path)}` : null,
      pdf_url: d.pdf_path ? `/files/${path.basename(d.pdf_path)}` : null,
      created_at: d.created_at,
    },
  });
});

// GET /documents/:id/download
documentsRoutes.get("/:id/download", requireAuth(), async (req: AuthRequest, res: Response) => {
  const s = req.tenantSchema!;
  const result = await pool.query(
    `SELECT denomination, docx_path, pdf_path FROM "${s}".documents WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Document non trouvé" });
  }

  const doc = result.rows[0];
  const format = req.query.format === "pdf" ? "pdf" : "docx";
  const filePath = format === "pdf" ? doc.pdf_path : doc.docx_path;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Fichier ${format.toUpperCase()} non disponible` });
  }

  const ext = format === "pdf" ? "pdf" : "docx";
  const contentType = format === "pdf"
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const safeName = (doc.denomination || "document").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}.${ext}"`);
  res.sendFile(filePath);
});
