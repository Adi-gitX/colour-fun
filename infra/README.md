# Atlas — Static-site Infrastructure (Terraform)

Provisions the AWS resources to host the Atlas SPA as an **S3 Static Website**.
This stack is independent of [`../terraform/`](../terraform/) (which manages the
**ECR + ECS Fargate** container deploy). Both stacks own disjoint AWS resources
and disjoint Terraform state.

## What this stack creates

- **S3 bucket** — `atlas-prod-site`, versioned, server-side encrypted, with
  Static Website Hosting enabled.
- **Bucket policy** — public `s3:GetObject` for everyone (so the website
  endpoint serves the SPA).
- **Public Access Block** — deliberately allows public access so the website
  policy takes effect.

**No CloudFront.** AWS Academy revokes the CloudFront write APIs
(`CreateOriginAccessControl`, `CreateResponseHeadersPolicy`,
`CreateDistribution`), so we serve the site directly from the S3 website
endpoint. Trade-off is HTTP only and no edge cache. For a non-Academy
production deploy, restore CloudFront from git history before commit
`e042023` and flip the bucket back to private.

## Live URL

```
http://atlas-prod-site.s3-website-us-east-1.amazonaws.com
```

## Layout

```
infra/
├── providers.tf        # AWS provider, default tags
├── backend.tf          # Remote state in S3 + DynamoDB lock table
├── variables.tf        # project, environment, region inputs
├── locals.tf           # name_prefix, common_tags
├── s3.tf               # site bucket + versioning + SSE + public website + policy
├── cloudfront.tf       # intentionally empty — see comment inside
└── outputs.tf          # site_bucket, site_url, site_website_endpoint
```

## One-time bootstrap

Terraform's S3 backend needs a state bucket and a DynamoDB lock table to exist
before `terraform init`. Run once per AWS account:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws s3api create-bucket \
  --bucket "atlas-tfstate-${ACCOUNT_ID}" \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket "atlas-tfstate-${ACCOUNT_ID}" \
  --versioning-configuration Status=Enabled

aws dynamodb create-table \
  --table-name atlas-tfstate-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

`backend.tf` already points at `atlas-tfstate-747207933464` for the active
Academy account — update it if your account id differs.

## Local apply

```bash
cd infra
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

Outputs:

```bash
terraform output site_bucket             # → atlas-prod-site
terraform output site_url                # → http://atlas-prod-site.s3-website-us-east-1.amazonaws.com
terraform output site_website_endpoint   # → atlas-prod-site.s3-website-us-east-1.amazonaws.com
```

## Deploying the site

After `terraform apply`, ship the Vite build to the bucket:

```bash
cd ../solid-colour
npm ci
npm run build

BUCKET=$(cd ../infra && terraform output -raw site_bucket)

# Long, immutable cache for fingerprinted assets
aws s3 sync dist/ "s3://${BUCKET}/" --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "manifest.webmanifest" \
  --exclude "sw.js"

# index.html — short cache so updates roll out fast
aws s3 cp dist/index.html "s3://${BUCKET}/index.html" \
  --cache-control "public, max-age=0, must-revalidate"

# Service worker — never cache (PWA updates land immediately)
aws s3 cp dist/sw.js "s3://${BUCKET}/sw.js" \
  --cache-control "no-cache, no-store, must-revalidate" 2>/dev/null || true
```

The chained CI workflow at [.github/workflows/pipeline.yml](../.github/workflows/pipeline.yml)
runs all of the above on every push to `main`. It's gated behind the
`AWS_DEPLOY_ENABLED` repo variable so unconfigured forks stay green.

## Required CI secrets / variables

GitHub repo variables:

| Name                 | Value                            |
| -------------------- | -------------------------------- |
| `AWS_DEPLOY_ENABLED` | `"true"` — turns the pipeline on |

GitHub repo secrets (Academy issues these as a triplet that rotates every ~4h):

| Name                    | Value                            |
| ----------------------- | -------------------------------- |
| `AWS_ACCESS_KEY_ID`     | from Academy `AWS Details` panel |
| `AWS_SECRET_ACCESS_KEY` | from Academy `AWS Details` panel |
| `AWS_SESSION_TOKEN`     | from Academy `AWS Details` panel |

Refresh these every Academy session. If they expire mid-pipeline, the workflow
fails at the AWS auth step with `ExpiredToken` — the fix is to re-run the
secret-update commands and re-trigger.

## Cost guardrail

Steady-state cost for an unloaded SPA:

| Resource            | Cost                                             |
| ------------------- | ------------------------------------------------ |
| S3 bucket (10 MB)   | ≈ $0 (well under free-tier)                      |
| S3 GET requests     | $0.0004 per 1k GETs after first 20k/mo free-tier |
| DynamoDB lock table | PAY_PER_REQUEST, fractions of a cent per apply   |

Bandwidth out of S3 is the only meaningful cost driver. For a portfolio at
single-digit visits per day, total monthly cost rounds to zero.

Run `terraform destroy` from this directory at the end of an Academy
session — Academy budget caps are real, and the lock table is cheap but
not free.
