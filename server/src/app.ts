import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { createLogger } from "./utils/logger";

const logger = createLogger("App");
import { authRoutes } from "./routes/auth";
import { generateRoutes } from "./routes/generate.routes";
import { documentsRoutes } from "./routes/documents.routes";
import { templatesRoutes } from "./routes/templates.routes";
import { userRoutes } from "./routes/user.routes";
import { chatRoutes } from "./routes/chat";
import { conversationRoutes } from "./routes/conversations";

export const app = express();

// ── CORS (fix #8 — utiliser le middleware cors au lieu du manuel) ──
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8081").split(",").map(s => s.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://auth.normx-ai.com"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ── Rate limiting (fix #3) ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requetes par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requetes, reessayez dans 15 minutes" },
});

const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 generations par minute
  message: { error: "Trop de generations, reessayez dans 1 minute" },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 messages par minute
  message: { error: "Trop de messages, reessayez dans 1 minute" },
});

app.use("/api", apiLimiter);

// ── Static files for generated documents ──
app.use("/files", express.static(path.join(__dirname, "../generated")));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/generate", generateLimiter, generateRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);
app.use("/api/conversations", conversationRoutes);

// ── Health check ──
app.get("/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok", service: "normx-legal" });
});

// ── Nettoyage fichiers generes > 24h (fix #10) ──
const GENERATED_DIR = path.join(__dirname, "../generated");
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 heure
const MAX_FILE_AGE = 24 * 60 * 60 * 1000; // 24 heures

function cleanupGeneratedFiles() {
  try {
    if (!fs.existsSync(GENERATED_DIR)) return;
    const files = fs.readdirSync(GENERATED_DIR);
    const now = Date.now();
    let cleaned = 0;
    for (const file of files) {
      const filePath = path.join(GENERATED_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > MAX_FILE_AGE) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.info(`[cleanup] ${cleaned} fichier(s) genere(s) supprime(s) (> 24h)`);
    }
  } catch (err) {
    logger.error("[cleanup] Erreur:", err);
  }
}

// Lancer le nettoyage au demarrage + toutes les heures
cleanupGeneratedFiles();
setInterval(cleanupGeneratedFiles, CLEANUP_INTERVAL);

// ── 404 for API routes ──
app.all("/api/{*path}", (_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Route non trouvee" });
});

// ── SPA fallback ──
app.use(express.static(path.join(__dirname, "../mobile/dist")));
app.get("{*path}", (_req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, "../mobile/dist/index.html"));
});

// ── Error handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("[error]", err.message);
  res.status(500).json({ error: "Erreur interne du serveur" });
});
