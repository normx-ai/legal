import { createDocument } from "../../db/documents";
import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validateSaAg } from "../../services/validator";
import { generateDocx, prepareSaAgData } from "../../services/docx-generator";
import pool from "../../db/pool";

export const saAgRoute = Router();

// POST /generate/sa-ag
saAgRoute.post("/sa-ag", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    // 1. Validate
    const errors = validateSaAg(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 2. Prepare data for template
    const templateData = prepareSaAgData(req.body);

    // 3. Generate DOCX
    const docxBuffer = generateDocx("sa-ag/statuts.docx", templateData);

    // 4. Save file
    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sa-ag-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    // 5. Save to database
    const document = await createDocument({
      tenantSchema: (req as AuthRequest).tenantSchema!,
      userId: (req as AuthRequest).userId!,
      type: "statuts-sa-ag",
      denomination: req.body.denomination,
      formeJuridique: "SA AG",
      docxPath: filepath,
      data: req.body,
    });

    res.status(201).json({
      document: {
        id: document.id,
        type: document.type,
        label: document.label,
        forme_juridique: document.formeJuridique,
        denomination: document.denomination,
        status: document.status,
        docx_url: `/files/${filename}`,
        created_at: document.createdAt.toISOString(),
      },
      docx_url: `/files/${filename}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? (err instanceof Error ? err.message : "Erreur inconnue") : "Erreur lors de la génération";
    console.error("[generate/sa-ag]", err);
    res.status(500).json({ error: message });
  }
});
