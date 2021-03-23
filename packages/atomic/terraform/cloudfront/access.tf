resource "aws_cloudfront_origin_access_identity" "website_access_identity" {
  comment = "Access from website cloudfront"
}

data "aws_iam_policy_document" "bucket_policy_document" {
  statement {
    sid       = "website"
    actions   = ["s3:GetObject"]
    resources = ["${module.website_bucket.bucket_arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.website_access_identity.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = module.website_bucket.bucket_name
  policy = data.aws_iam_policy_document.bucket_policy_document.json
}
