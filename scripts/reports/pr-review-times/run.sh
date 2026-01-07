#!/bin/bash

if [ -z "$GITHUB_TOKEN" ]; then
  echo "GITHUB_TOKEN is not set. Fetching from 1Password..." >&2
  export GITHUB_TOKEN="$(op --account "coveo.1password.com" item get "github coveo token" --fields label=password --reveal)"

  if [ -z "$GITHUB_TOKEN" ]; then
    echo "Failed to retrieve GITHUB_TOKEN from 1Password." >&2
    echo "In your Coveo Vault, make sure there exists an item named 'github coveo token' with the token in the password field." >&2
    exit 1
  fi
fi

current_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$current_dir/index.mjs" fetch "is:pr label:cross-team base:main created:>2025-11-01"
node "$current_dir/index.mjs" report
