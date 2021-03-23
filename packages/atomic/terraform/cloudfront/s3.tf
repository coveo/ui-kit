module "website_bucket" {
  source                = "git::https://github.com/coveo/security-modules//modules/s3_bucket?ref=v1.4.13"
  env                   = var.env
  prefix                = var.prefix
  name                  = var.website_bucket_name
  enable_versioning     = false
  target_bucket_logging = var.infra.bucket_audit_logs
  log_retention_type    = var.log_retention_type
  tags                  = local.tags
}