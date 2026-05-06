# terraform/ — Container deploy stack (ECR + ECS Fargate)

Terraform that provisions the **containerized** deploy path for Atlas:
private ECR repository, ECS Fargate cluster, task definition, service, and
CloudWatch log group.

This stack is independent of [`../infra/`](../infra/) (which manages the
static-site path: S3 + CloudFront). They own disjoint AWS resources and
disjoint Terraform state files.

## AWS Academy compatibility

This stack is **AWS-Academy compatible** — it does **not** create any IAM
resources. Students on Academy can't create roles or policies, so we pass
the pre-provisioned `LabRole` to ECS as both the task execution role and
the task role. Academy's `LabRole` already has the right permissions baked
in for ECR pulls and CloudWatch log writes.

The only inputs Academy users need to supply are:

| Input               | Where to find it                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `subnet_id`         | AWS console → VPC → Subnets → any default-VPC subnet                                                               |
| `security_group_id` | AWS console → VPC → Security groups → default SG (then add an inbound TCP rule for `container_port`, default 8080) |

## One-time bootstrap (Academy)

```bash
# 1. In the Academy console, click "Start Lab", wait for the green dot,
#    then click "AWS Details" and copy the temporary credentials.
export AWS_ACCESS_KEY_ID=<from Academy>
export AWS_SECRET_ACCESS_KEY=<from Academy>
export AWS_SESSION_TOKEN=<from Academy>
export AWS_REGION=us-east-1

# 2. Find your default VPC subnet:
aws ec2 describe-subnets \
  --filters Name=default-for-az,Values=true \
  --query 'Subnets[0].SubnetId' --output text

# 3. Find your default security group (then add a TCP:8080 inbound rule
#    in the console — Academy lets you edit existing SGs but not create
#    new ones reliably):
aws ec2 describe-security-groups \
  --filters Name=group-name,Values=default \
  --query 'SecurityGroups[0].GroupId' --output text

# 4. Drop those two values into terraform.tfvars:
cat > terraform.tfvars <<EOF
subnet_id         = "subnet-xxxxxxxx"
security_group_id = "sg-yyyyyyyy"
EOF

# 5. Apply:
terraform init
terraform plan
terraform apply
```

The first apply uses a public placeholder image so the task definition is
valid before any image has been pushed to ECR. Subsequent applies (or
GitHub Actions runs) override `image_tag` to the actual built image.

## CI integration

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) runs the
full pipeline on push to `main`, gated behind the `LAB_DEPLOY_ENABLED`
repo variable so unconfigured forks stay green:

1. Test (lint + format + vitest)
2. `terraform apply` (creates / converges the infra)
3. Docker build + push to the ECR repo Terraform created
4. `aws ecs update-service --force-new-deployment` to roll the task

Required GitHub repo secrets (Settings → Secrets and variables → Actions
→ Secrets):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` _(Academy creds always include this; refresh when the
  4-hour Academy session expires)_

Required GitHub repo variables (same page → Variables tab):

- `LAB_DEPLOY_ENABLED` = `true`
- `LAB_SUBNET_ID` = `subnet-xxxxxxxx`
- `LAB_SECURITY_GROUP_ID` = `sg-yyyyyyyy`

## Why no IAM, no separate SG, no VPC?

Academy revokes most of those APIs. The friend-repo pattern this stack
follows is the proven Academy-compatible shape:

- **No `aws_iam_role`** — Academy's `LabRole` is reused.
- **No `aws_security_group`** — students supply the id of one they
  edited in the console.
- **No `aws_vpc` / `aws_subnet`** — the default VPC's existing subnets
  are reused.

For a non-Academy / production deploy, swap to a dedicated VPC + private
subnets + ALB + a custom IAM role. Treat this stack as the lab variant.

## Cost guardrails

| Resource        | Free-tier coverage                        | Steady cost / month         |
| --------------- | ----------------------------------------- | --------------------------- |
| ECR storage     | 500 MB free for the first 12 months       | ≈ $0 for a single image     |
| ECS Fargate     | 0.25 vCPU + 0.5 GB always-on              | ≈ $9 for a single 24/7 task |
| CloudWatch Logs | 5 GB ingest / 5 GB archive free per month | ≈ $0 for portfolio traffic  |

Academy labs auto-stop after a few hours, so steady-state cost while
you're not actively running a session is effectively zero. **Run
`terraform destroy` at the end of each working session** to be safe —
Academy budget caps are real.

## Destroy when done

```bash
terraform destroy
```

ECR `force_delete = true` and the lifecycle policy mean this nukes
everything cleanly, no orphaned images.
