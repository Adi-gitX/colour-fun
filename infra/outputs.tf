output "site_bucket" {
  description = "S3 bucket name where the built site is uploaded."
  value       = aws_s3_bucket.site.bucket
}

output "site_bucket_arn" {
  description = "ARN of the site bucket."
  value       = aws_s3_bucket.site.arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — used by CI for cache invalidation after each deploy."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain" {
  description = "Default *.cloudfront.net hostname for the distribution."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  description = "Public URL the site is served on."
  value = local.has_custom_domain ? "https://${var.domain_name}" : (
    "https://${aws_cloudfront_distribution.site.domain_name}"
  )
}
