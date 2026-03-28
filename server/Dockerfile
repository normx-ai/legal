FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine

# LibreOffice for PDF conversion
RUN apk add --no-cache libreoffice

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/data ./data

RUN mkdir -p /app/generated

EXPOSE 3004

CMD ["sh", "-c", "sleep 5 && npx prisma migrate deploy && node dist/server.js"]
