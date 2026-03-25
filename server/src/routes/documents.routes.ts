import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../server";

export const documentsRoutes = Router();

// GET /documents
documentsRoutes.get("/", requireAuth(), async (req: AuthRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      label: true,
      formeJuridique: true,
      denomination: true,
      status: true,
      docxPath: true,
      pdfPath: true,
      createdAt: true,
    },
  });

  res.json({
    documents: documents.map((d) => ({
      id: d.id,
      type: d.type,
      label: d.label,
      forme_juridique: d.formeJuridique,
      denomination: d.denomination,
      status: d.status,
      docx_url: d.docxPath ? `/files/${path.basename(d.docxPath)}` : null,
      pdf_url: d.pdfPath ? `/files/${path.basename(d.pdfPath)}` : null,
      created_at: d.createdAt.toISOString(),
    })),
  });
});

// GET /documents/:id
documentsRoutes.get("/:id", requireAuth(), async (req: AuthRequest, res: Response) => {
  const doc = await prisma.document.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!doc) {
    return res.status(404).json({ error: "Document non trouvé" });
  }

  res.json({
    document: {
      id: doc.id,
      type: doc.type,
      label: doc.label,
      forme_juridique: doc.formeJuridique,
      denomination: doc.denomination,
      status: doc.status,
      data: doc.data,
      docx_url: doc.docxPath ? `/files/${path.basename(doc.docxPath)}` : null,
      pdf_url: doc.pdfPath ? `/files/${path.basename(doc.pdfPath)}` : null,
      created_at: doc.createdAt.toISOString(),
    },
  });
});

// GET /documents/:id/download
documentsRoutes.get("/:id/download", requireAuth(), async (req: AuthRequest, res: Response) => {
  const doc = await prisma.document.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!doc) {
    return res.status(404).json({ error: "Document non trouvé" });
  }

  const format = req.query.format === "pdf" ? "pdf" : "docx";
  const filePath = format === "pdf" ? doc.pdfPath : doc.docxPath;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Fichier ${format.toUpperCase()} non disponible` });
  }

  const ext = format === "pdf" ? "pdf" : "docx";
  const contentType = format === "pdf"
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${doc.denomination}-statuts.${ext}"`);
  res.sendFile(filePath);
});
