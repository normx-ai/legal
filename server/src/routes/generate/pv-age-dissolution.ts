import { createDocument } from "../../db/documents";
import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validatePvAgeDissolution } from "../../services/validator";
import { generateDocx, preparePvAgeDissolutionData } from "../../services/docx-generator";
import pool from "../../db/pool";

export const pvAgeDissolutionRoute = Router();

pvAgeDissolutionRoute.post("/pv-age-dissolution", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validatePvAgeDissolution(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = preparePvAgeDissolutionData(req.body);
    const docxBuffer = generateDocx("pv-age-dissolution/pv-age-dissolution.docx", templateData);

    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `pv-age-dissolution-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await createDocument({
      tenantSchema: (req as AuthRequest).tenantSchema!,
      userId: (req as AuthRequest).userId!,
      type: "pv-age-dissolution",
      denomination: req.body.denomination,
      formeJuridique: "SA",
      docxPath: filepath,
      data: req.body,
    });

    res.status(201).json({
      document: {
        id: document.id, type: document.type, label: document.label,
        forme_juridique: document.formeJuridique, denomination: document.denomination,
        status: document.status, docx_url: `/files/${filename}`,
        created_at: document.createdAt.toISOString(),
      },
      docx_url: `/files/${filename}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? (err instanceof Error ? err.message : "Erreur inconnue") : "Erreur lors de la génération";
    console.error("[generate/pv-age-dissolution]", err);
    res.status(500).json({ error: message });
  }
});
