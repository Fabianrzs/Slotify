# ── Dependencies ─────────────────────────────────────────────────────────────
# Build context must be the monorepo root (../../)
FROM node:22-alpine AS deps
WORKDIR /monorepo

RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/tenant/package.json ./apps/tenant/

# Install only tenant dependencies
RUN pnpm install --filter @slotify/tenant --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /monorepo

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/apps/tenant/node_modules ./apps/tenant/node_modules
COPY apps/tenant ./apps/tenant

WORKDIR /monorepo/apps/tenant
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
#   apps/tenant/
#     server.js
#     .next/
COPY --from=build /monorepo/apps/tenant/public ./apps/tenant/public
COPY --from=build --chown=nextjs:nodejs /monorepo/apps/tenant/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /monorepo/apps/tenant/.next/static ./apps/tenant/.next/static

USER nextjs
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/tenant/server.js"]
