# Atlas — Infrastructure (Terraform)

Provisions the AWS infrastructure needed to host the Atlas SPA in production:

- **S3 bucket** — private, versioned, server-side encrypted; the static site lives here.
- **CloudFront distribution** — CDN in front of the bucket, locked to it via Origin Access Control (OAC).
- **Response headers policy** — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- **SPA fallback** — 403/404 from S3 → 200 index.html so client-side routes resolve.

No RDS, no ECS, no ALB — Atlas is frontend-only, so the right architecture is a static origin behind a CDN.

## Layout

```
infra/
├── providers.tf        # AWS provider, default tags, us-east-1 alias for CloudFront
├── backend.tf          # Remote state in S3 + DynamoDB lock table
├── variables.tf        # project, environment, region, domain inputs
├── locals.tf           # name_prefix, common_tags
├── s3.tf               # site bucket + versioning + SSE + bucket policy (CF OAC only)
├── cloudfront.tf       # distribution + OAC + cache behaviors + SPA error responses
└── outputs.tf          # bucket name, distribution id, public URL
```

## One-time bootstrap

Terraform's S3 backend needs a bucket and a DynamoDB lock table to exist before `terraform init`. Run once per AWS account:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws s3api create-bucket \
  --bucket "atlas-tfstate-${ACCOUNT_ID}" \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket "atlas-tfstate-${ACCOUNT_ID}" \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket "atlas-tfstate-${ACCOUNT_ID}" \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws dynamodb create-table \
  --table-name atlas-tfstate-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

Then update `backend.tf` — replace `atlas-tfstate-REPLACE_ME` with `atlas-tfstate-<ACCOUNT_ID>`.

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
terraform output site_bucket               # → atlas-prod-site
terraform output cloudfront_distribution_id  # → E1A2B3C4D5
terraform output site_url                  # → https://d1abcdef.cloudfront.net
```

## Deploying the site

After `terraform apply`, ship the Vite build to the bucket and bust the CDN cache:

```bash
cd ../solid-colour
npm ci
npm run build

BUCKET=$(cd ../infra && terraform output -raw site_bucket)
DIST=$(cd ../infra && terraform output -raw cloudfront_distribution_id)

aws s3 sync dist/ "s3://${BUCKET}/" --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "manifest.webmanifest" \
  --exclude "sw.js"

aws s3 cp dist/index.html "s3://${BUCKET}/index.html" \
  --cache-control "public, max-age=0, must-revalidate"

aws s3 cp dist/manifest.webmanifest "s3://${BUCKET}/manifest.webmanifest" \
  --cache-control "public, max-age=0, must-revalidate" 2>/dev/null || true

aws s3 cp dist/sw.js "s3://${BUCKET}/sw.js" \
  --cache-control "no-cache, no-store, must-revalidate" 2>/dev/null || true

aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*"
```

The chained CI workflow at [.github/workflows/pipeline.yml](../.github/workflows/pipeline.yml) automates all of the above. It is gated behind the `AWS_DEPLOY_ENABLED` repo variable so it stays green by default.

## Custom domain (optional)

1. Issue an ACM certificate in **us-east-1** covering your domain (CloudFront only reads certs from us-east-1).
2. Validate the cert via DNS.
3. Re-apply with the cert ARN and domain:

```bash
terraform apply \
  -var "domain_name=atlas.yourdomain.com" \
  -var "acm_certificate_arn=arn:aws:acm:us-east-1:${ACCOUNT_ID}:certificate/<id>"
```

4. Create an `ALIAS` (Route 53) or `CNAME` (other DNS) record pointing your domain at the CloudFront `domain_name` output.

## Required CI secrets / variables

GitHub repo variables:

- `AWS_DEPLOY_ENABLED` = `"true"` (turns the pipeline on)

GitHub repo secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (only if using temporary credentials, e.g. AWS Academy / SSO)

Without these the pipeline workflow short-circuits — repo stays green.

## Cost guardrail

Steady-state cost for an unloaded SPA:

- S3 bucket (10 MB, versioned) — pennies per month
- CloudFront (PriceClass_100, low traffic) — typically <$1/month for hobby use
- DynamoDB lock table (PAY_PER_REQUEST) — fractions of a cent per apply

Safe to leave running.
