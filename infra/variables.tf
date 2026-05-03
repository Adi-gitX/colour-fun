variable "project" {
  description = "Project slug — used as a prefix for every named resource."
  type        = string
  default     = "atlas"
}

variable "environment" {
  description = "Environment name (prod, staging, etc.). Becomes part of resource names + tags."
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for the S3 bucket and any regional resources."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = <<EOT
Optional custom domain (e.g. atlas.yourdomain.com). If empty, the site is
served at the default *.cloudfront.net URL only. Set this once you've
issued an ACM cert in us-east-1 for the domain — then re-apply.
EOT
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = <<EOT
ARN of an ACM certificate in us-east-1 covering `domain_name`. Required
if `domain_name` is set, ignored otherwise.
EOT
  type        = string
  default     = ""
}

variable "default_root_object" {
  description = "The file CloudFront serves for `/`."
  type        = string
  default     = "index.html"
}

variable "spa_fallback_path" {
  description = <<EOT
Path CloudFront serves for any 403/404 from S3 — keeps client-side routing
working when users deep-link to a hash-router or path-router URL.
EOT
  type        = string
  default     = "/index.html"
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 is cheapest (NA + EU edge locations only)."
  type        = string
  default     = "PriceClass_100"
}
