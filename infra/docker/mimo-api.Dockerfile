# Dedicated deployment image: preserve the server's existing Dockerfile edits.
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
RUN npm ci --include-workspace-root --workspace=apps/api --workspace=packages/types

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npm run db:generate --workspace api \
    && npm run build --workspace api \
    && test -f apps/api/dist/src/main.js

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages/types ./packages/types
COPY --from=builder --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=node:node /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
WORKDIR /app/apps/api
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||4000)+'/api/v1/assistant/status').then(r=>{if(!r.ok)process.exit(1);return r.json()}).then(v=>{if(v.data?.provider!=='internal-knowledge')process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/src/main.js"]
