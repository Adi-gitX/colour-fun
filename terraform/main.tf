# =============================================================================
# Atlas — container deploy infrastructure (ECR + ECS Fargate).
#
# AWS-Academy compatible: this stack does **not** create any IAM resources.
# It uses the pre-provisioned `LabRole` that every Academy account ships
# with for both the ECS task execution role and the task role.
#
# Pipeline shape:
#
#   GitHub Actions  ─►  Build Docker image  ─►  Push to ECR  ─►  ECS service
#                  └─►  terraform apply     ─►  ECR repo + ECS cluster + service
#
# Independent from the `infra/` project (S3 + CloudFront for the static-site
# path). The two stacks own disjoint AWS resources and disjoint Terraform
# state, so they can be applied or destroyed without affecting each other.
#
# Inputs you must pass once via `terraform.tfvars` (or the equivalent CI
# secrets):
#
#   subnet_id         — a subnet in the default VPC. AWS console → VPC →
#                       Subnets → pick any default-VPC public subnet.
#   security_group_id — a security group in the same VPC that allows
#                       inbound on `container_port`. The default VPC ships
#                       with a "default" SG; either reuse it (and add an
#                       inbound rule) or create a new one in the console.
# =============================================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # Remote state in S3 with DynamoDB locking — same bucket as the infra/
  # stack, different key. Required so every CI run reads the current
  # resource state instead of trying to re-create things on every apply.
  # Bootstrap commands (one-time):
  #
  #   ACCT=$(aws sts get-caller-identity --query Account --output text)
  #   aws s3api create-bucket --bucket atlas-tfstate-$ACCT --region us-east-1
  #   aws s3api put-bucket-versioning --bucket atlas-tfstate-$ACCT \
  #     --versioning-configuration Status=Enabled
  #   aws dynamodb create-table --table-name atlas-tfstate-locks \
  #     --attribute-definitions AttributeName=LockID,AttributeType=S \
  #     --key-schema AttributeName=LockID,KeyType=HASH \
  #     --billing-mode PAY_PER_REQUEST --region us-east-1
  backend "s3" {
    bucket         = "atlas-tfstate-747207933464"
    key            = "atlas-containers/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "atlas-tfstate-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Stack       = "containers"
    }
  }
}

# Auto-fetch the current AWS account id so we can build the LabRole ARN
# without hard-coding it (Academy issues a new account every semester).
data "aws_caller_identity" "current" {}

locals {
  # Pre-existing role provided by AWS Academy — students cannot create or
  # modify IAM roles, but every account already has this one wired up with
  # ECS / ECR / CloudWatch permissions.
  lab_role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"

  ecr_image_uri   = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
  effective_image = var.image_tag == "bootstrap" ? var.placeholder_image : local.ecr_image_uri
}

# -----------------------------------------------------------------------------
# ECR repository — image registry the GitHub workflow pushes into.
# -----------------------------------------------------------------------------
resource "aws_ecr_repository" "app" {
  name                 = "${var.project_name}-app"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep only the last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# -----------------------------------------------------------------------------
# CloudWatch log group — Fargate task stdout/stderr lands here.
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 14
}

# -----------------------------------------------------------------------------
# ECS cluster (Fargate-only).
# -----------------------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

# -----------------------------------------------------------------------------
# Task definition — references the ECR image by URL + tag.
# The first-ever apply uses `placeholder_image` (a public image) so the
# definition is valid before the workflow has pushed anything to ECR. Every
# subsequent CI run flips this to the freshly pushed image via `image_tag`.
# Both `execution_role_arn` and `task_role_arn` point at LabRole — Academy's
# pre-provisioned role with the right ECR / CloudWatch permissions baked in.
# -----------------------------------------------------------------------------
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = local.lab_role_arn
  task_role_arn            = local.lab_role_arn

  container_definitions = jsonencode([{
    name      = "app"
    image     = local.effective_image
    essential = true

    portMappings = [{
      containerPort = var.container_port
      hostPort      = var.container_port
      protocol      = "tcp"
    }]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.app.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "app"
      }
    }
  }])
}

# -----------------------------------------------------------------------------
# Service — keeps `desired_count` tasks running, replaces unhealthy ones.
# `assign_public_ip = true` so the task is reachable without an ALB.
# `force_new_deployment = true` so every `terraform apply` after a fresh
# `docker push` pulls the new image without a separate `aws ecs update-service`
# call.
# -----------------------------------------------------------------------------
resource "aws_ecs_service" "app" {
  name                 = "${var.project_name}-service"
  cluster              = aws_ecs_cluster.main.id
  task_definition      = aws_ecs_task_definition.app.arn
  desired_count        = var.desired_count
  launch_type          = "FARGATE"
  force_new_deployment = true

  network_configuration {
    subnets          = [var.subnet_id]
    security_groups  = [var.security_group_id]
    assign_public_ip = true
  }
}
