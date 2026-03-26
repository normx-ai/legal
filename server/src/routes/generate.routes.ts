import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateSarl, validateSarlu, validateSaAg, validateSaUni, validateSaCa, validateSasu, validateSas, validateGie, validateStePart, validateDrc } from "../services/validator";
import { generateDocx, prepareSarlData, prepareSarluData, prepareSaAgData, prepareSaUniData, prepareSaCaData, prepareSasuData, prepareSasData, prepareGieData, prepareStePartData, prepareDrcData } from "../services/docx-generator";
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la génération";
    console.error("[generate/sarlu]", err);
    res.status(500).json({ error: message });
  }
});

// POST /generate/sa-ag
generateRoutes.post("/sa-ag", requireAuth(), async (req: AuthRequest, res: Response) => {
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
    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sa-ag-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    // 5. Save to database
    const document = await prisma.document.create({
      data: {
        type: "statuts-sa-ag",
        label: `Statuts SA AG — ${req.body.denomination}`,
        formeJuridique: "SA AG",
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
    console.error("[generate/sa-ag]", err);
    res.status(500).json({ error: message });
  }
});

// POST /generate/sa-uni
generateRoutes.post("/sa-uni", requireAuth(), async (req: AuthRequest, res: Response) => {
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
    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sa-uni-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    // 5. Save to database
    const document = await prisma.document.create({
      data: {
        type: "statuts-sa-uni",
        label: `Statuts SA UNI — ${req.body.denomination}`,
        formeJuridique: "SA UNI",
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
    console.error("[generate/sa-uni]", err);
    res.status(500).json({ error: message });
  }
});

// POST /generate/sa-ca
generateRoutes.post("/sa-ca", requireAuth(), async (req: AuthRequest, res: Response) => {
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
    const generatedDir = path.join(__dirname, "../../generated");
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

// POST /generate/sasu
generateRoutes.post("/sasu", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    // 1. Validate
    const errors = validateSasu(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 2. Prepare data for template
    const templateData = prepareSasuData(req.body);

    // 3. Generate DOCX
    const docxBuffer = generateDocx("sasu/statuts.docx", templateData);

    // 4. Save file
    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sasu-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    // 5. Save to database
    const document = await prisma.document.create({
      data: {
        type: "statuts-sasu",
        label: `Statuts SASU — ${req.body.denomination}`,
        formeJuridique: "SASU",
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
    console.error("[generate/sasu]", err);
    res.status(500).json({ error: message });
  }
});

// POST /generate/sas
generateRoutes.post("/sas", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    // 1. Validate
    const errors = validateSas(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 2. Prepare data for template
    const templateData = prepareSasData(req.body);

    // 3. Generate DOCX
    const docxBuffer = generateDocx("sas/statuts.docx", templateData);

    // 4. Save file
    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-sas-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    // 5. Save to database
    const document = await prisma.document.create({
      data: {
        type: "statuts-sas",
        label: `Statuts SAS — ${req.body.denomination}`,
        formeJuridique: "SAS",
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
    console.error("[generate/sas]", err);
    res.status(500).json({ error: message });
  }
});

// POST /generate/gie
generateRoutes.post("/gie", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validateGie(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = prepareGieData(req.body);
    const docxBuffer = generateDocx("gie/statuts.docx", templateData);

    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `convention-gie-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await prisma.document.create({
      data: {
        type: "convention-gie",
        label: `Convention GIE — ${req.body.denomination}`,
        formeJuridique: "GIE",
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
    console.error("[generate/gie]", err);
    res.status(500).json({ error: message });
  }
});

// POST /generate/ste-part
generateRoutes.post("/ste-part", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validateStePart(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = prepareStePartData(req.body);
    const docxBuffer = generateDocx("ste-part/statuts.docx", templateData);

    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `statuts-ste-part-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await prisma.document.create({
      data: {
        type: "statuts-ste-part",
        label: `Statuts Société en Participation — ${req.body.denomination}`,
        formeJuridique: "STE PART",
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
    console.error("[generate/ste-part]", err);
    res.status(500).json({ error: message });
  }
});

// POST /generate/drc
generateRoutes.post("/drc", requireAuth(), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validateDrc(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const templateData = prepareDrcData(req.body);
    const docxBuffer = generateDocx("drc/declaration.docx", templateData);

    const generatedDir = path.join(__dirname, "../../generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeNom = req.body.denomination.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const filename = `drc-${safeNom}-${timestamp}.docx`;
    const filepath = path.join(generatedDir, filename);

    fs.writeFileSync(filepath, docxBuffer);

    const document = await prisma.document.create({
      data: {
        type: "drc",
        label: `DRC — ${req.body.denomination}`,
        formeJuridique: req.body.forme_juridique || "Transversal",
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
    console.error("[generate/drc]", err);
    res.status(500).json({ error: message });
  }
});
