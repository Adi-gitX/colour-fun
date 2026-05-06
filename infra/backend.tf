# Remote state in S3.
#
# Bootstrap (one-time, before `terraform init`):
#
#   aws s3api create-bucket --bucket atlas-tfstate-<account-id> --region us-east-1
#   aws s3api put-bucket-versioning \
#     --bucket atlas-tfstate-<account-id> \
#     --versioning-configuration Status=Enabled
#   aws dynamodb create-table \
#     --table-name atlas-tfstate-locks \
#     --attribute-definitions AttributeName=LockID,AttributeType=S \
#     --key-schema AttributeName=LockID,KeyType=HASH \
#     --billing-mode PAY_PER_REQUEST
#
# Then fill the bucket name below and run `terraform init`.
terraform {
  backend "s3" {
    bucket         = "atlas-tfstate-747207933464"
    key            = "atlas/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "atlas-tfstate-locks"
    encrypt        = true
  }
}
