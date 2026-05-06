output "site_bucket" {
  description = "S3 bucket name where the built site is uploaded."
  value       = aws_s3_bucket.site.bucket
}

output "site_bucket_arn" {
  description = "ARN of the site bucket."
  value       = aws_s3_bucket.site.arn
}

output "site_url" {
  description = "Public URL the site is served on (S3 website endpoint)."
  value       = "http://${aws_s3_bucket_website_configuration.site.website_endpoint}"
}

output "site_website_endpoint" {
  description = "Raw S3 website endpoint hostname (no scheme)."
  value       = aws_s3_bucket_website_configuration.site.website_endpoint
}
