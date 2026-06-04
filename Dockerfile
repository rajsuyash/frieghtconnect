# Deterministic build for Railway. A fresh pnpm install on this Debian (glibc,
# x64) image always fetches the correct native bindings (@tailwindcss/oxide,
# lightningcss) — avoiding the Nixpacks frozen-lockfile / cache pitfalls.
FROM node:22-slim AS build
WORKDIR /app

# Prisma engines + TLS need openssl.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

# Install deps (postinstall runs `prisma generate`, so the schema must be present).
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma
RUN pnpm install --no-frozen-lockfile

# Build the app.
COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# start:prod runs `prisma migrate deploy` then `next start`.
CMD ["pnpm", "start:prod"]
