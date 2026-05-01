# FSDE 2025 — DevOps Course Timeline

What the lecturer (**Pottabathini Vivekananda**) pushed and when, mapped to this repo. Use this to plan your own commits.

> Source: lecturer's commits on `Newton-School/shopsmart` and on student forks (e.g. `nandu-99/shopsmart`).

| #       | Date           | Phase / theme                                                | Files in this repo                                                                                                                                                                                                   | Status   |
| ------- | -------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 01      | 2026-01-27     | First GitHub Actions workflow                                | [.github/workflows/github-actions.yml](.github/workflows/github-actions.yml)                                                                                                                                         | done     |
| 02      | 2026-02-05     | Shell scripts                                                | [devops/scripts/](devops/scripts/)                                                                                                                                                                                   | done     |
| 03      | 2026-02-06     | EC2 launch script                                            | [devops/scripts/](devops/scripts/)                                                                                                                                                                                   | done     |
| 04      | 2026-02-09     | Lab — workflow refinement                                    | workflows                                                                                                                                                                                                            | done     |
| 05      | 2026-02-12     | Lab — workflow improvements                                  | workflows                                                                                                                                                                                                            | done     |
| 06      | 2026-02-13     | Variables, secrets, matrix, artifacts, deploy                | [.github/workflows/02-variables-secrets-artifacts.yml](.github/workflows/02-variables-secrets-artifacts.yml), [.github/workflows/deploy-to-ec2.yml](.github/workflows/deploy-to-ec2.yml)                             | done     |
| 07      | 2026-02-16     | Lint/format + Slack                                          | [.github/workflows/integration.yml](.github/workflows/integration.yml)                                                                                                                                               | done     |
| 08      | 2026-02-19     | Unit + integration + e2e                                     | [.github/workflows/unit-integration.yaml](.github/workflows/unit-integration.yaml), [.github/workflows/frontend-tests.yml](.github/workflows/frontend-tests.yml)                                                     | done     |
| 09      | 2026-02-20     | gh-pages + HashRouter                                        | [.github/workflows/gh-pages.yml](.github/workflows/gh-pages.yml), [vercel.json](vercel.json)                                                                                                                         | done     |
| 10      | 2026-02-23     | EC2 HTML submodule                                           | n/a (skipped — not needed for this app)                                                                                                                                                                              | skipped  |
| 11      | 2026-03-18     | Dependabot + node matrix + green CI                          | [.github/dependabot.yml](.github/dependabot.yml), [.github/workflows/03-server-matrix-test.yml](.github/workflows/03-server-matrix-test.yml)                                                                         | done     |
| 12      | 2026-03-19     | Responsiveness + backend Dockerfile                          | [solid-colour/Dockerfile](solid-colour/Dockerfile) (frontend variant)                                                                                                                                                | done     |
| 13      | 2026-03-24     | Docker workflow                                              | [.github/workflows/deploy-to-docker.yml](.github/workflows/deploy-to-docker.yml)                                                                                                                                     | done     |
| **14a** | **2026-05-01** | **Phase 0 — Husky + Gitleaks**                               | [.husky/pre-commit](.husky/pre-commit), [.gitleaksignore](.gitleaksignore), [.prettierignore](.prettierignore), [package.json](package.json), [.github/workflows/secret-scan.yml](.github/workflows/secret-scan.yml) | **done** |
| **14b** | **2026-05-01** | **Phase 1 — JUnit + coverage + consolidated tests workflow** | [.github/workflows/tests.yml](.github/workflows/tests.yml), [solid-colour/package.json](solid-colour/package.json) (`test:ci`)                                                                                       | **done** |
| **14c** | **2026-05-01** | **Phase 2a — Multi-stage Dockerfile + docker-compose**       | [solid-colour/Dockerfile](solid-colour/Dockerfile), [solid-colour/nginx.conf](solid-colour/nginx.conf), [docker-compose.yml](docker-compose.yml), [render.yaml](render.yaml)                                         | **done** |

## What auto-runs on push/PR (the "green" target)

| Workflow                                             | Triggers                | What needs to pass                                                           |
| ---------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| [tests.yml](.github/workflows/tests.yml)             | push + PR on any branch | Frontend lint + format + vitest with JUnit/coverage + build + Playwright e2e |
| [secret-scan.yml](.github/workflows/secret-scan.yml) | push + PR on any branch | gitleaks finds zero leaks                                                    |
| [gh-pages.yml](.github/workflows/gh-pages.yml)       | push to main            | Vite build + deploy to GitHub Pages                                          |

Everything else under [.github/workflows/](.github/workflows/) is `workflow_dispatch:` only — they're kept as lecture demos but do not affect green status.

## Optional repo secrets (only matter for manual dispatches)

- `EC2_SSH_KEY`, `EC2_HOST`, `EC2_USERNAME` → `deploy-to-ec2.yml`
- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` → `deploy-to-docker.yml`
- `SLACK_WEBHOOK_URL` → `integration.yml`
- `GITLEAKS_LICENSE` → optional; gitleaks-action is free for personal public repos

## Suggested commit cadence going forward

If you keep pushing one demo/refinement per lecture, the lecturer can see a coherent progression. The next likely course phase is **Phase 2b — ECS / cloud deploy**, which will build on `docker-compose.yml`.
