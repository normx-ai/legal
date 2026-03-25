import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { PrismaClient } from "@prisma/client";

const PORT = parseInt(process.env.PORT || "3004", 10);
export const prisma = new PrismaClient();

const server = app.listen(PORT, () => {
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
