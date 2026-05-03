# Atlas — Submission checklist

Rubric mapping for the post-midsem deliverable. Every requirement points at
the file (and the commit) that proves it. For the narrative version see
[POST-MIDSEM-NOTES.md](POST-MIDSEM-NOTES.md).

> Repo: <https://github.com/Adi-gitX/colour-fun> · App: Atlas (Vite + React 19 SPA)

---

## Phase 0 · Pre-commit + secret scanning

| #   | Requirement                                          | File                                                                           | Commit    |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | --------- |
| 0.1 | Husky + lint-staged for pre-commit Prettier          | [`solid-colour/package.json`](solid-colour/package.json) → `lint-staged` block | `28646ca` |
| 0.2 | Cross-cutting pre-commit hooks (yaml/whitespace/EOL) | [`.pre-commit-config.yaml`](.pre-commit-config.yaml)                           | repo init |
| 0.3 | gitleaks secret scan on push, PR, weekly cron        | [`.github/workflows/secret-scan.yml`](.github/workflows/secret-scan.yml)       | `c7c059f` |
| 0.4 | CodeQL (security-and-quality query pack)             | [`.github/workflows/codeql.yml`](.github/workflows/codeql.yml)                 | `26fd36b` |
| 0.5 | No `.npmrc` / secrets ever committed                 | [`.gitignore`](solid-colour/.gitignore) — `.npmrc` excluded                    | repo init |

---

## Phase 1 · Tests with coverage + JUnit + e2e

| #   | Requirement                                                                 | File                                                                               | Commit    |
| --- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------- |
| 1.1 | Vitest config with v8 coverage + JUnit reporter                             | [`solid-colour/vitest.config.ts`](solid-colour/vitest.config.ts)                   | `28646ca` |
| 1.2 | `npm run test:ci` runs vitest with coverage; JUnit activates when `CI=true` | [`solid-colour/package.json`](solid-colour/package.json) → `scripts.test:ci`       | `28646ca` |
| 1.3 | Playwright e2e smoke spec                                                   | [`solid-colour/e2e/smoke.spec.ts`](solid-colour/e2e/smoke.spec.ts)                 | `8f97001` |
| 1.4 | Playwright config — vite preview in CI, dev locally                         | [`solid-colour/playwright.config.ts`](solid-colour/playwright.config.ts)           | `cb9daa0` |
| 1.5 | Single `tests.yml` with split jobs + concurrency                            | [`.github/workflows/tests.yml`](.github/workflows/tests.yml)                       | `cb9daa0` |
| 1.6 | `ci-success` aggregator job for branch protection                           | [`.github/workflows/tests.yml`](.github/workflows/tests.yml) — bottom job          | `cb9daa0` |
| 1.7 | ESLint with `--max-warnings 0`                                              | [`solid-colour/package.json`](solid-colour/package.json) → `scripts.lint`          | `28646ca` |
| 1.8 | Prettier check job                                                          | [`.github/workflows/tests.yml`](.github/workflows/tests.yml) — `format-check` step | `cb9daa0` |
| 1.9 | hadolint Dockerfile lint                                                    | [`.github/workflows/tests.yml`](.github/workflows/tests.yml) — `hadolint` job      | `cb9daa0` |

---

## Phase 2a · Containerization

| #    | Requirement                                                | File                                                                                                  | Commit    |
| ---- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------- |
| 2a.1 | Multi-stage Dockerfile (builder → runtime)                 | [`solid-colour/Dockerfile`](solid-colour/Dockerfile)                                                  | `938c4c5` |
| 2a.2 | nginx-unprivileged base (non-root, port 8080)              | [`solid-colour/Dockerfile`](solid-colour/Dockerfile) — `FROM nginxinc/nginx-unprivileged:1.27-alpine` | `bc5b749` |
| 2a.3 | nginx config: SPA fallback + cache + sw.js no-cache        | [`solid-colour/nginx.conf`](solid-colour/nginx.conf)                                                  | `b194833` |
| 2a.4 | Real security headers (frame, content-type, CSP, etc.)     | [`solid-colour/nginx.conf`](solid-colour/nginx.conf)                                                  | `1ee43b2` |
| 2a.5 | docker-compose with read-only FS + cap_drop + no-new-privs | [`docker-compose.yml`](docker-compose.yml)                                                            | `2ee0ec0` |
| 2a.6 | Pinned base image (nginx 1.27, not `:alpine`)              | [`solid-colour/Dockerfile`](solid-colour/Dockerfile)                                                  | `bc5b749` |

---

## Phase 2b / 3 · Terraform infrastructure

| #   | Requirement                                             | File                                         | Commit    |
| --- | ------------------------------------------------------- | -------------------------------------------- | --------- |
| 3.1 | S3 remote state + DynamoDB lock                         | [`infra/backend.tf`](infra/backend.tf)       | `c8bf3e1` |
| 3.2 | Pinned AWS provider with default tags                   | [`infra/providers.tf`](infra/providers.tf)   | `c8bf3e1` |
| 3.3 | Static site bucket: versioning + AES256 + PAB on        | [`infra/s3.tf`](infra/s3.tf)                 | `c8bf3e1` |
| 3.4 | CloudFront with Origin Access Control (OAC)             | [`infra/cloudfront.tf`](infra/cloudfront.tf) | `c8bf3e1` |
| 3.5 | Response Headers Policy (HSTS, frame, referrer)         | [`infra/cloudfront.tf`](infra/cloudfront.tf) | `c8bf3e1` |
| 3.6 | SPA fallback for client-side routing (403/404 → /index) | [`infra/cloudfront.tf`](infra/cloudfront.tf) | `c8bf3e1` |
| 3.7 | Pipeline-readable outputs                               | [`infra/outputs.tf`](infra/outputs.tf)       | `c8bf3e1` |
| 3.8 | Bootstrap docs                                          | [`infra/README.md`](infra/README.md)         | `a83984f` |
| 3.9 | tfstate / .terraform / .tfvars in `.gitignore`          | [`.gitignore`](.gitignore)                   | `bc0d3ac` |

---

## Phase 4 · Chained CI/CD pipeline

| #   | Requirement                                                                      | File                                                                                | Commit    |
| --- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------- |
| 4.1 | Single chained workflow: test → terraform → deploy                               | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml)                  | `6b2bacb` |
| 4.2 | Test job: lint + format check + vitest with coverage + JUnit                     | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) — `test`         | `6b2bacb` |
| 4.3 | Terraform job: init → fmt -check → validate → plan → apply, outputs captured     | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) — `terraform`    | `6b2bacb` |
| 4.4 | Deploy job: vite build → S3 sync → CloudFront invalidate                         | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) — `deploy`       | `6b2bacb` |
| 4.5 | Smart cache headers: hashed assets immutable, HTML revalidate, sw.js no-cache    | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) — `deploy` step  | `6b2bacb` |
| 4.6 | Concurrency lock so two runs never race the same tfstate                         | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) — `concurrency`  | `6b2bacb` |
| 4.7 | Gated behind `AWS_DEPLOY_ENABLED` repo variable so unconfigured forks stay green | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) — `if:` per job  | `6b2bacb` |
| 4.8 | Least-privilege workflow permissions (`contents: read`, `id-token: write`)       | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) — `permissions:` | `6b2bacb` |
| 4.9 | Run summary in `$GITHUB_STEP_SUMMARY` with bucket / distribution / URL           | [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) — `Summary` step | `6b2bacb` |

---

## Cross-cutting

| #   | Requirement                                          | File                                                                                                                                             | Commit      |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| X.1 | README — architecture diagram + tech stack + scripts | [`README.md`](README.md)                                                                                                                         | `3a8cbea`   |
| X.2 | PRD — full product requirements doc                  | [`PRD.md`](PRD.md)                                                                                                                               | `1deedb1`   |
| X.3 | Issue + PR templates                                 | [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE), [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)                      | `65ecc6e`   |
| X.4 | Dependabot config + auto-merge for safe bumps        | [`.github/dependabot.yml`](.github/dependabot.yml), [`.github/workflows/dependabot-auto-merge.yml`](.github/workflows/dependabot-auto-merge.yml) | `b1ec0c3`   |
| X.5 | Cost notes                                           | [`POST-MIDSEM-NOTES.md`](POST-MIDSEM-NOTES.md) → "Credits & cost"                                                                                | this commit |

---

## How to verify locally

```bash
# Lint + format + tests + build (matches CI)
cd solid-colour
npm ci
npm run lint
npm run format:check
CI=true npm run test:ci
npm run build
npm run test:e2e

# Local container
cd ..
docker compose up --build       # → http://localhost:8080

# Terraform plan (requires AWS creds + bootstrapped tfstate bucket)
cd infra
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan
```

To dry-run the chained pipeline against AWS, set the repo variable
`AWS_DEPLOY_ENABLED=true` and the secrets `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, then run
`gh workflow run pipeline.yml`.
