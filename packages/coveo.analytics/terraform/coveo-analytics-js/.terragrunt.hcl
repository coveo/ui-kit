include {
  path = find_in_parent_folders()
}

inputs = {
  import_prefix   = "@"
  import_projects = [
    "cdn/static-cloud-coveo-com",
  ]
}
