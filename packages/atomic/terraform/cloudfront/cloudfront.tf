resource "aws_cloudfront_distribution" "website" {
  # checkov:skip=CKV_AWS_68: AWS WAF is not mandatory for this CloudFront distribution
  # checkov:skip=CKV_AWS_86: Access logging is not mandatory for this CloudFront distribution

  origin {
    domain_name = module.website_bucket.bucket_regional_domain_name
    origin_path = "/${local.remote_website_path}"
    origin_id   = "origin-${module.website_bucket.bucket_name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.website_access_identity.cloudfront_access_identity_path
    }
  }

  enabled             = true
  default_root_object = "index.html"

  aliases = [var.cloudfront_alias]

  price_class = "PriceClass_100"

  default_cache_behavior {
    target_origin_id = "origin-${module.website_bucket.bucket_name}"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    compress         = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 1200
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.infra.server_certificate_star_env_cloudfront_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2018"
  }

  tags = local.tags
}
