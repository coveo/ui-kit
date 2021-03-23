locals {
  tags = {
    "coveo_environment" = var.env
    "coveo_billing"     = "ua__mt__atomic"
  }
}

variable "cloudfront_alias" {
  default = "atomic.dev.cloud.coveo.com"
  type    = string
}

variable "website_bucket_name" {
  description = "S3 bucket name that will contains atomic files"
}