import { createDocument } from "../../db/documents";
import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validateSaUni } from "../../services/validator";
import { generateDocx, prepareSaUniData } from "../../services/docx-generator";
import pool from "../../db/pool";

export const saUniRoute = Router();

// POST /generate/sa-uni
saUniRoute.post("/sa-uni", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    // 1. Validate
    const errors = validateSaUni(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 2. Prepare data for template
    const templateData = prepareSaUniData(req.body);

    // 3. Generate DOCX
    const docxBuffer = generateDocx("sa-uni/statuts.docx", templateData);

    // 4. Save file
    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sa-uni-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    // 5. Save to database
    const document = await createDocument({
      tenantSchema: (req as AuthRequest).tenantSchema!,
      userId: (req as AuthRequest).userId!,
      type: "statuts-sa-uni",
      denomination: req.body.denomination,
      formeJuridique: "SA UNI",
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
    console.error("[generate/sa-uni]", err);
    res.status(500).json({ error: message });
  }
});
