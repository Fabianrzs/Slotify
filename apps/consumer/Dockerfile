# ── Dependencies ─────────────────────────────────────────────────────────────
# Build context must be the monorepo root (../../)
FROM node:22-alpine AS deps
WORKDIR /monorepo

RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/consumer/package.json ./apps/consumer/

# Install only consumer dependencies
RUN pnpm install --filter @slotify/consumer --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /monorepo

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/apps/consumer/node_modules ./apps/consumer/node_modules
COPY apps/consumer ./apps/consumer

WORKDIR /monorepo/apps/consumer
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# With outputFileTracingRoot set to monorepo root, standalone structure is:
# .next/standalone/
#   node_modules/          <- real (non-symlink) packages
#   apps/consumer/
#     server.js
#     .next/
COPY --from=build /monorepo/apps/consumer/public ./apps/consumer/public
COPY --from=build --chown=nextjs:nodejs /monorepo/apps/consumer/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /monorepo/apps/consumer/.next/static ./apps/consumer/.next/static

USER nextjs
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/consumer/server.js"]
