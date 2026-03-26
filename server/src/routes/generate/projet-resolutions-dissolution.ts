import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validateProjetResolutionsDissolution } from "../../services/validator";
import { generateDocx, prepareProjetResolutionsDissolutionData } from "../../services/docx-generator";
import { prisma } from "../../server";

export const projetResolutionsDissolutionRoute = Router();

projetResolutionsDissolutionRoute.post("/projet-resolutions-dissolution", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validateProjetResolutionsDissolution(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = prepareProjetResolutionsDissolutionData(req.body);
    const docxBuffer = generateDocx("projet-resolutions-dissolution/projet-resolutions-dissolution.docx", templateData);

    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `projet-resolutions-dissolution-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await prisma.document.create({
      data: {
        type: "projet-resolutions-dissolution",
        label: `Projet résolutions dissolution — ${req.body.denomination}`,
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
    console.error("[generate/projet-resolutions-dissolution]", err);
    res.status(500).json({ error: message });
  }
});
