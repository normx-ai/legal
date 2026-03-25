import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateSarl, validateSarlu } from "../services/validator";
import { generateDocx, prepareSarlData, prepareSarluData } from "../services/docx-generator";
import { prisma } from "../server";

export const generateRoutes = Router();

// POST /generate/sarl
generateRoutes.post("/sarl", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    // 1. Validate
    const errors = validateSarl(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 2. Prepare data for template
    const templateData = prepareSarlData(req.body);

    // 3. Generate DOCX
    const docxBuffer = generateDocx("sarl/statuts.docx", templateData);

    // 4. Save file
    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sarl-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    // 5. Save to database
    const document = await prisma.document.create({
      data: {
        type: "statuts-sarl",
        label: `Statuts SARL — ${req.body.denomination}`,
        formeJuridique: "SARL",
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
  } catch (err: any) {
    console.error("[generate/sarl]", err);
    res.status(500).json({ error: err.message || "Erreur lors de la génération" });
  }
});

// POST /generate/sarlu
generateRoutes.post("/sarlu", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validateSarlu(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = prepareSarluData(req.body);
    const docxBuffer = generateDocx("sarlu/statuts.docx", templateData);

    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sarlu-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await prisma.document.create({
      data: {
        type: "statuts-sarlu",
        label: `Statuts SARLU — ${req.body.denomination}`,
        formeJuridique: "SARLU",
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
  } catch (err: any) {
    console.error("[generate/sarlu]", err);
    res.status(500).json({ error: err.message || "Erreur lors de la génération" });
  }
});
