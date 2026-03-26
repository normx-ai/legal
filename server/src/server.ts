import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { app } from "./app";
import { PrismaClient } from "@prisma/client";

const PORT = parseInt(process.env.PORT || "3004", 10);
export const prisma = new PrismaClient();

// CORS origins depuis .env
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8081").split(",").map(s => s.trim());
console.log("[CORS] Origines autorisées:", allowedOrigins);

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,x-organization-id");
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  // Passer à Express pour le reste
  app(req, res);
});

server.listen(PORT, () => {
  console.log(`[normx-legal] Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("[normx-legal] Shutting down...");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
