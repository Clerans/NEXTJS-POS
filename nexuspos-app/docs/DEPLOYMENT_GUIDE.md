# NEXUSPOS Production Deployment & Infrastructure Guide

**Target Environments:** Vercel / AWS ECS / Docker / Kubernetes / Node.js 20+ LTS  
**Database:** Managed PostgreSQL (AWS RDS / Neon / Supabase) with SSL enabled

---

## 1. Environment Variables Configuration (`.env.production`)

```env
# Application Runtime
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pos.nexusenterprise.com

# Database Connection (PostgreSQL)
DATABASE_URL=postgresql://nexus_user:StrongPasswordHere@db.nexuspos.com:5432/nexuspos_production?sslmode=require
DB_SSL=true

# Cryptographic Keys
JWT_SECRET=super_secret_cryptographic_key_min_64_characters_long_for_hs256_or_sha512
MANAGER_PIN_SALT=nexuspos_override_salt_2026

# POS Printer & Thermal Receipt Hardware (Local Bridge / Network)
DEFAULT_PRINTER_IP=192.168.1.200
DEFAULT_PRINTER_PORT=9100
THERMAL_PAPER_WIDTH_MM=80

# Logging & Telemetry
LOG_LEVEL=info
```

---

## 2. Docker Multi-Stage Production Build (`Dockerfile`)

```dockerfile
# Step 1: Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Step 2: Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Step 3: Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Step 4: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 3. Database Migration & Initialization Runbook

```bash
# 1. Apply Schema Migrations
npx prisma migrate deploy # (or psql -d $DATABASE_URL -f docs/DATABASE_SCHEMA.sql)

# 2. Seed Initial Admin & Reference Data
npm run db:seed

# 3. Verify Health Endpoint
curl -f https://pos.nexusenterprise.com/api/health || exit 1
```
