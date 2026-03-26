import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { validatePvCarenceAgo } from "../../services/validator";
import { generateDocx, preparePvCarenceAgoData } from "../../services/docx-generator";
import { prisma } from "../../server";

export const pvCarenceAgoRoute = Router();

pvCarenceAgoRoute.post("/pv-carence-ago", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validatePvCarenceAgo(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = preparePvCarenceAgoData(req.body);
    const docxBuffer = generateDocx("pv-carence-ago/pv-carence-ago.docx", templateData);

    const generatedDir = path.join(__dirname, "../../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `pv-carence-ago-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await prisma.document.create({
      data: {
        type: "pv-carence-ago",
        label: `PV de carence AGO — ${req.body.denomination}`,
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
    const message = err instanceof Error ? err.message : "Erreur lors de la génération";
    console.error("[generate/pv-carence-ago]", err);
    res.status(500).json({ error: message });
  }
});
