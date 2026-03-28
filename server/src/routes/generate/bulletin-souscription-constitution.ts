import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validateBulletinSouscriptionConstitution } from "../../services/validator";
import { generateDocx, prepareBulletinSouscriptionConstitutionData } from "../../services/docx-generator";
import { prisma } from "../../server";

export const bulletinSouscriptionConstitutionRoute = Router();

bulletinSouscriptionConstitutionRoute.post("/bulletin-souscription-constitution", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validateBulletinSouscriptionConstitution(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = prepareBulletinSouscriptionConstitutionData(req.body);
    const docxBuffer = generateDocx("bulletin-souscription-constitution/bulletin-souscription-constitution.docx", templateData);

    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `bulletin-souscription-constitution-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await prisma.document.create({
      data: {
        type: "bulletin-souscription-constitution",
        label: `Bulletin de souscription constitution — ${req.body.denomination}`,
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
    console.error("[generate/bulletin-souscription-constitution]", err);
    res.status(500).json({ error: message });
  }
});
