# Stage 1: Build TypeScript backend
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN cp -r src/migrations dist/migrations

# Stage 2: Runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./dist/migrations
COPY --from=builder /app/src/migrations ./src/migrations

EXPOSE 5000

# Bootstrap: run DB migrations (via server initDatabase) then seed data, then start server
CMD ["node", "dist/server.js"]
