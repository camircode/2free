FROM node:24-bookworm-slim AS build
WORKDIR /workspace
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json workspace.d.ts ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @2free/database db:generate
RUN pnpm --filter @2free/api build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
COPY --from=build /workspace /workspace
EXPOSE 3001
CMD ["pnpm", "--filter", "@2free/api", "start"]
