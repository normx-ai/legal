import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validateRapportCaDissolution } from "../../services/validator";
import { generateDocx, prepareRapportCaDissolutionData } from "../../services/docx-generator";
import { prisma } from "../../server";

export const rapportCaDissolutionRoute = Router();

rapportCaDissolutionRoute.post("/rapport-ca-dissolution", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validateRapportCaDissolution(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = prepareRapportCaDissolutionData(req.body);
    const docxBuffer = generateDocx("rapport-ca-dissolution/rapport-ca-dissolution.docx", templateData);

    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `rapport-ca-dissolution-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await prisma.document.create({
      data: {
        type: "rapport-ca-dissolution",
        label: `Rapport CA dissolution — ${req.body.denomination}`,
        formeJuridique: "SA",
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
        id: document.id, type: document.type, label: document.label,
        forme_juridique: document.formeJuridique, denomination: document.denomination,
        status: document.status, docx_url: `/files/${filename}`,
        created_at: document.createdAt.toISOString(),
      },
      docx_url: `/files/${filename}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la génération";
    console.error("[generate/rapport-ca-dissolution]", err);
    res.status(500).json({ error: message });
  }
});
