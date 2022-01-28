variable "package_version" {
  description = "Defines the major version that has just been deployed"
}

data "aws_ssm_parameter" "svc_coveoanalyticsjs_secret" {
  name = "/${var.env}/coveoanalyticsjs/svcAccountSecret"
}

resource "null_resource" "invalidate-cloudfront" {
  provisioner "local-exec" {
    command = "aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths \"/coveo.analytics.js/${var.package_version}/*\""

    environment = {
      CLOUDFRONT_DISTRIBUTION_ID="E2VWLFSCSD1GLA"
      AWS_ACCESS_KEY_ID="AKIAYKDJLZITZZKEN7WY"
      AWS_SECRET_ACCESS_KEY=data.aws_ssm_parameter.svc_coveoanalyticsjs_secret.value
      AWS_DEFAULT_REGION=var.region
    }
  }
}