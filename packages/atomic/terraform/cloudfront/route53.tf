resource "aws_route53_record" "website_endpoint" {
  zone_id = var.infra.infra.domain_id
  name    = var.cloudfront_alias
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
