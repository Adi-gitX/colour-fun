# =============================================================================
# Atlas — static-site S3 bucket (Academy-compatible).
#
# AWS Academy revokes the CloudFront APIs (CreateOriginAccessControl,
# CreateResponseHeadersPolicy, etc.), so we can't front the bucket with
# a CDN here. Instead we serve the SPA directly via S3 Website Hosting,
# which Academy fully supports.
#
# Trade-off: public HTTP only (no HTTPS, no edge caching). For a real
# production deploy, restore cloudfront.tf — see git history before
# 2026-05-06 for the OAC + response-headers-policy + distribution config.
# =============================================================================

resource "aws_s3_bucket" "site" {
  bucket = "${local.name_prefix}-site"
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Disable the "block all public" guards — required for static-website
# hosting where the bucket policy grants public read.
resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Static-website hosting — index.html for `/`, fallback to index.html
# for 403/404 so client-side routing keeps working on deep links.
resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = var.default_root_object
  }

  error_document {
    key = trimprefix(var.spa_fallback_path, "/")
  }
}

# Public read policy — anyone on the internet can GET objects.
data "aws_iam_policy_document" "site_bucket" {
  statement {
    sid     = "AllowPublicRead"
    effect  = "Allow"
    actions = ["s3:GetObject"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    resources = ["${aws_s3_bucket.site.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site_bucket.json

  depends_on = [aws_s3_bucket_public_access_block.site]
}
