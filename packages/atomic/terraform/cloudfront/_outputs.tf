output "bucket_info" {
  value = module.website_bucket
}

output "cloudfront_info" {
  value = aws_cloudfront_distribution.website
}