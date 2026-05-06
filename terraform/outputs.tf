output "ecr_repository_url" {
  description = "ECR repository URL — used by CI to docker-tag and push."
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name — used by CI's aws ecr login + push."
  value       = aws_ecr_repository.app.name
}

output "ecs_cluster_name" {
  description = "ECS cluster name — used by `aws ecs update-service`."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name — used by `aws ecs update-service --force-new-deployment`."
  value       = aws_ecs_service.app.name
}

output "task_definition_family" {
  description = "Task definition family — register new revisions under this name."
  value       = aws_ecs_task_definition.app.family
}

output "log_group" {
  description = "CloudWatch log group the task streams to."
  value       = aws_cloudwatch_log_group.app.name
}

output "lab_role_arn" {
  description = "The Academy LabRole ARN we passed to ECS — useful for sanity-checking."
  value       = local.lab_role_arn
}
