variable "aws_region" {
  description = "AWS region the cluster + ECR repo live in. Academy labs default to us-east-1."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Slug used to prefix every resource name."
  type        = string
  default     = "atlas"
}

variable "environment" {
  description = "Environment tag (dev / staging / prod / lab)."
  type        = string
  default     = "lab"
}

# -----------------------------------------------------------------------------
# Academy-specific networking inputs — pass these once via terraform.tfvars
# (see terraform/README.md for where to find them in the AWS console).
# -----------------------------------------------------------------------------
variable "subnet_id" {
  description = <<EOT
Subnet id where the Fargate task runs. Must be a public subnet in the
default VPC so `assign_public_ip = true` actually gets an internet-routable
address. Find it at AWS console → VPC → Subnets → any row with
"Default subnet" = Yes.
EOT
  type        = string
}

variable "security_group_id" {
  description = <<EOT
Security group id attached to the task ENI. Must allow inbound on
`container_port` (8080 by default) so the container is reachable. The
default VPC ships with a "default" SG — add an inbound TCP rule for 8080
(or 80) and pass that SG's id here.
EOT
  type        = string
}

# -----------------------------------------------------------------------------
# Container shape
# -----------------------------------------------------------------------------
variable "container_port" {
  description = <<EOT
Port the container listens on. Atlas's nginx-unprivileged image listens on
8080 (the default for the unprivileged image — non-root user can't bind 80).
EOT
  type        = number
  default     = 8080
}

variable "task_cpu" {
  description = "Fargate CPU units (256 = 0.25 vCPU)."
  type        = string
  default     = "256"
}

variable "task_memory" {
  description = "Fargate memory in MiB. Must be valid for the chosen CPU."
  type        = string
  default     = "512"
}

variable "desired_count" {
  description = "Number of running tasks the service maintains."
  type        = number
  default     = 1
}

# -----------------------------------------------------------------------------
# Image
# -----------------------------------------------------------------------------
variable "image_tag" {
  description = <<EOT
Tag of the ECR image the task definition pulls. Set to `bootstrap` on the
very first apply (when the ECR repo is still empty) so the task uses
`placeholder_image` instead. CI overrides this to the git SHA on every run.
EOT
  type        = string
  default     = "bootstrap"
}

variable "placeholder_image" {
  description = <<EOT
Public image used when `image_tag = bootstrap`. Lets `terraform apply`
succeed before the GitHub workflow has pushed an Atlas image to ECR.
EOT
  type        = string
  default     = "public.ecr.aws/nginx/nginx:stable-alpine"
}
