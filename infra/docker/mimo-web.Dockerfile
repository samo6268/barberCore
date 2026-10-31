# Builds all workspace dependencies needed by the reference React adapter.
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app
COPY package*.json turbo.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/types/package*.json ./packages/types/
COPY packages/assistant-core/package*.json ./packages/assistant-core/
COPY packages/assistant-react/package*.json ./packages/assistant-react/
COPY packages/assistant-web-component/package*.json ./packages/assistant-web-component/
RUN npm ci --include-workspace-root --workspace=apps/web --workspace=packages/ui --workspace=packages/types \
    --workspace=packages/assistant-core --workspace=packages/assistant-react \
    --workspace=packages/assistant-web-component

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx turbo build --filter=web \
    && test -f apps/web/.next/standalone/apps/web/server.js

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
WORKDIR /app/apps/web
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
