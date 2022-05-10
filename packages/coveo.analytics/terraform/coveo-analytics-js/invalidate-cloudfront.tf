locals {
  # until the cdn project is deployed, the variable does not exist yet, so we are taking default value.
  cloudfront_id = try(var.cdn.static_cloud_coveo_com.static_cloudfront_id, var.cloudfront_id)
}

variable "cloudfront_id" {
  description = "Cloudfront distribution id (will soon be dynamic and removed)"
  default     = ""
}

variable "package_version" {
  description = "Defines the major version that has just been deployed"
}

resource "null_resource" "invalidate-cloudfront" {
  # do not do the call if the id is empty
  count = local.cloudfront_id != "" ? 1 : 0
  provisioner "local-exec" {
    command = "aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths \"/coveo.analytics.js/${var.package_version}/*\""

    environment = {
      CLOUDFRONT_DISTRIBUTION_ID = local.cloudfront_id
      AWS_DEFAULT_REGION         = var.region
    }
  }
}
