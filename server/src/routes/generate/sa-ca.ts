import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validateSaCa } from "../../services/validator";
import { generateDocx, prepareSaCaData } from "../../services/docx-generator";
import { prisma } from "../../server";

export const saCaRoute = Router();

// POST /generate/sa-ca
saCaRoute.post("/sa-ca", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    // 1. Validate
    const errors = validateSaCa(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 2. Prepare data for template
    const templateData = prepareSaCaData(req.body);

    // 3. Generate DOCX
    const docxBuffer = generateDocx("sa-ca/statuts.docx", templateData);

    // 4. Save file
    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sa-ca-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    // 5. Save to database
    const document = await prisma.document.create({
      data: {
        type: "statuts-sa-ca",
        label: `Statuts SA CA — ${req.body.denomination}`,
        formeJuridique: "SA CA",
        denomination: req.body.denomination,
        status: "generated",
        data: req.body,
        docxPath: filepath,
        userId: req.userId!,
        organizationId: req.orgId || null,
      },
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
    const message = err instanceof Error ? err.message : "Erreur lors de la génération";
    console.error("[generate/sa-ca]", err);
    res.status(500).json({ error: message });
  }
});
