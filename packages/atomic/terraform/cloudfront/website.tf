locals {
  remote_website_path = "website"
  local_website_path  = "../../www"
}

resource "aws_s3_bucket_object" "website" {
  for_each     = fileset(local.local_website_path, "**")
  bucket       = module.website_bucket.bucket_name
  key          = "${local.remote_website_path}/${each.value}"
  source       = "${local.local_website_path}/${each.value}"
  etag         = filemd5("${local.local_website_path}/${each.value}")
  content_type = "text/html"
}

