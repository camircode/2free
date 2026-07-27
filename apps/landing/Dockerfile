FROM node:24-bookworm AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/landing ./apps/landing
COPY packages/ui/src/assets/2free-con-fondi.svg ./packages/ui/src/assets/2free-con-fondi.svg
COPY ["2free con texto debajo.png", "./2free con texto debajo.png"]
RUN pnpm install --frozen-lockfile --filter @2free/landing...
ARG PUBLIC_SITE_URL=http://localhost:4321
ARG PUBLIC_WEB_URL=http://localhost:3000
ARG PUBLIC_SOURCE_URL
ARG PUBLIC_GITHUB_REPOSITORY
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL PUBLIC_WEB_URL=$PUBLIC_WEB_URL PUBLIC_SOURCE_URL=$PUBLIC_SOURCE_URL PUBLIC_GITHUB_REPOSITORY=$PUBLIC_GITHUB_REPOSITORY
RUN pnpm --filter @2free/landing build

FROM nginx:1.29-alpine AS runtime
COPY --from=build /workspace/apps/landing/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
