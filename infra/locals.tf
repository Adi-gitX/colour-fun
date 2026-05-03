locals {
  name_prefix = "${var.project}-${var.environment}"

  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Repository  = "Adi-gitX/colour-fun"
  }

  has_custom_domain = var.domain_name != "" && var.acm_certificate_arn != ""
}
