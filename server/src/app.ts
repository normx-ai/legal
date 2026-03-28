import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { authRoutes } from "./routes/auth";
import { generateRoutes } from "./routes/generate.routes";
import { documentsRoutes } from "./routes/documents.routes";
import { templatesRoutes } from "./routes/templates.routes";
import { userRoutes } from "./routes/user.routes";
import { chatRoutes } from "./routes/chat";
import { conversationRoutes } from "./routes/conversations";

export const app = express();

// CORS est géré dans server.ts au niveau HTTP raw

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Static files for generated documents
app.use("/files", express.static(path.join(__dirname, "../generated")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "normx-legal" });
});

// 404 for API routes (Express 5 syntax)
app.all("/api/{*path}", (_req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// SPA fallback
app.use(express.static(path.join(__dirname, "../../mobile/dist")));
app.get("{*path}", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../mobile/dist/index.html"));
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[error]", err.message);
  res.status(500).json({ error: "Erreur interne du serveur" });
});
