FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-bookworm-slim

# LibreOffice for PDF conversion
RUN apt-get update && apt-get install -y --no-install-recommends libreoffice && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/data ./data

RUN mkdir -p /app/generated

# Frontend build (copie par le workflow dans server/public/)
COPY public/ /app/mobile/dist/

# Schema template pour les tenants
COPY src/db/tenant-schema.sql /app/dist/db/tenant-schema.sql

EXPOSE 3004

CMD ["sh", "-c", "sleep 3 && node dist/server.js"]
