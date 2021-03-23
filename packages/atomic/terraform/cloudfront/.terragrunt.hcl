include {
  path = find_in_parent_folders()
}

run_conditions {
  run_if = {
    env = ["dev"]
  }
}

inputs = {
  import_prefix   = "@"
}