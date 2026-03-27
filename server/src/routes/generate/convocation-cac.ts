import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validateConvocationCac } from "../../services/validator";
import { generateDocx, prepareConvocationCacData } from "../../services/docx-generator";
import { prisma } from "../../server";

export const convocationCacRoute = Router();

convocationCacRoute.post("/convocation-cac", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validateConvocationCac(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = prepareConvocationCacData(req.body);
    const docxBuffer = generateDocx("convocation-cac/convocation.docx", templateData);

    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `convocation-cac-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const formeJuridique = req.body.forme_juridique || "SARL";

    const document = await prisma.document.create({
      data: {
        type: "convocation-cac",
        label: `Convocation CAC — ${req.body.denomination}`,
        formeJuridique,
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
    console.error("[generate/convocation-cac]", err);
    res.status(500).json({ error: message });
  }
});
