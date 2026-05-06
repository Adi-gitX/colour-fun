# =============================================================================
# CloudFront is intentionally NOT provisioned in this stack.
#
# AWS Academy revokes cloudfront:CreateOriginAccessControl /
# cloudfront:CreateResponseHeadersPolicy / cloudfront:CreateDistribution,
# so this file is empty. The SPA is served directly via S3 Website
# Hosting (see s3.tf and the website endpoint in outputs.tf).
#
# To restore CloudFront for a non-Academy account, recover the previous
# version from git history. The static-site bucket would need to flip
# back to "private + CloudFront-only via OAC" at the same time.
# =============================================================================
