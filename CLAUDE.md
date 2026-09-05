# CLAUDE.md — `camircode/2free`

The original pnpm monorepo. It is the home of the **desktop and mobile
application** (`apps/desktop`: Tauri 2, Rust, Vite, SQLCipher) and of the
**published v0.1.x releases** — the AppImage and the signed APK that
`.github/workflows/release.yml` builds from a `v*` tag and attaches to GitHub
Releases, with `SHA256SUMS.txt`.

## The api, web and landing sources here are a stale copy

Those sources have been **split out into four separate repositories**, and the
copies in this checkout are now the older half of a fork:

| Here | Now lives in |
|---|---|
| `packages/{core,database,auth,data-provider,application,ui}` | `camircode/twofree-packages`, published as `@camircode/twofree-*` |
| `apps/api` | `camircode/twofree-api` |
| `apps/web` | `camircode/twofree-web` |
| `apps/landing` | `camircode/twofree-landing` |

Local checkouts: `/home/camir/Desarrollo/twofree-{packages,api,web,landing}`.

Nothing in this repository has been reduced yet. `pnpm-workspace.yaml` still
lists `apps/*` and `packages/*`, every internal dependency is still
`workspace:*`, and `apps/api/Dockerfile`, `apps/web/Dockerfile` and
`apps/landing/Dockerfile` are all still here. So the hazard is not theoretical:
a fix applied to `packages/ui/src/components/app-shell.tsx` **in this
repository** ships to the desktop app and to nobody else. The deployed web, API
and landing images are built from the other repositories and will never see it.

Before changing shared or server-side code here, decide which repository owns
the change:

- **The fix belongs upstream** → make it in `camircode/twofree-packages`,
  version it, publish it with a `v*` tag, then bump the consumers. A consumer
  that bumps to a version which is not published yet fails in the `deps` stage of
  its Docker build, as a resolver error about a tarball.
- **The fix is only about the desktop app** → make it here, in `apps/desktop`.
- **The fix is about the deployed service** → make it in `twofree-api`,
  `twofree-web` or `twofree-landing`. Nothing in this repository deploys: there
  is no `Jenkinsfile` here, and the three `Dockerfile`s under `apps/` build
  nothing that reaches the cluster.

Porting the same change to both places by hand is how the two copies drift.
Prefer moving the code, or moving the consumer, over duplicating the edit.

## Delivery, and what it is not

Two different `v*` tag pipelines exist across the project, in different
repositories, and they must not be confused:

- **Here**, a `v*` tag runs `release.yml`: it builds the AppImage and the Android
  APK, and publishes them to GitHub Releases. Current tags: `v0.1.0`–`v0.1.2`.
- **In `camircode/twofree-packages`**, a `v*` tag publishes all six packages to
  `https://npm.pkg.github.com`.

Neither of those is a deployment. The three deployable repositories deliver by:
commit to `main` → Jenkins polls every five minutes (a webhook is impossible: the
controller is only reachable over WireGuard, so GitHub cannot call it) → test in
a container → `docker buildx` push to GHCR **by digest** → smoke-test the image
by digest → Trivy (HIGH/CRITICAL, `--ignore-unfixed`) → commit the digest into
`camircode/gitops` → Argo CD syncs. The git log of `camircode/gitops` is the
deployment history, and the pipeline never touches the cluster.

Rules that hold wherever the change is made:

- **Never `kubectl apply`.** Argo CD is the only writer; a manual apply makes the
  cluster and the repository disagree, and Argo either reverts it or reports
  drift forever. `kubectl get/describe/logs/top`, `port-forward` and `exec` are
  fine.
- **Images by digest, never a tag and never `latest`.** A tag is a mutable
  pointer: two pods started an hour apart from the same tag can run different
  code, and a rollback to a tag rolls back to whatever that tag means today.
- **Secrets from Bitwarden Secrets Manager only** — never in a repository, a
  ConfigMap, a plaintext Secret in the GitOps repo, a Docker build `ARG` (it
  persists in image history), or a command line (shell history, and `ps`). Use a
  BuildKit secret mount. `compose.yml` and `.env` here are a local development
  convenience and are not a pattern to carry into an image.
- **Containers run non-root**, read-only root filesystem, all capabilities
  dropped, emptyDir at `/tmp`. Verify with
  `docker run --user ... --read-only --tmpfs /tmp`: this class of failure never
  appears in a build.
- **One PostgreSQL on `data-01`** with a role and database per application;
  **Gateway API, never `Ingress`**; infrastructure changes belong in
  `/home/camir/Desarrollo/infrastructure`.

## Working here

```sh
pnpm install                # --frozen-lockfile in CI; pnpm-lock.yaml is committed
pnpm check                  # format:check, lint, typecheck, test
pnpm dev:desktop            # Vite for apps/desktop
pnpm tauri:dev              # the Tauri shell
pnpm test:desktop
pnpm compose:up             # db + migration + api + web + landing, locally
```

`.github/workflows/quality.yml` runs `pnpm check` plus `pnpm test:browser` on
`main` and on pull requests, after `pnpm install --frozen-lockfile`. Any manifest
change must commit the regenerated `pnpm-lock.yaml` in the same commit.

`pretypecheck` and `pretest` run `db:generate` first: the database package does
not typecheck or test without a generated Prisma client, and
`packages/database/generated/` is gitignored.

Product and design intent live in `PRODUCT.md` and `DESIGN.md`; the spec-driven
change records live under `openspec/`.
