#!/usr/bin/env bash
#
# Ensures the two Quantic e2e scratch orgs exist and are usable by Playwright.
#
# Checks both orgs and both env files, provisions them with `pnpm run setup:examples`
# only if something is missing, then re-verifies. Safe to run every time: it is a
# no-op costing a couple of seconds when the environment is already good, and takes
# several minutes when it has to provision.
#
# Exit codes: 0 ready, 1 still not ready (message says what to fix), 2 wrong directory.
#

set -uo pipefail
ORGS="Quantic__LWS_enabled Quantic__LWS_disabled"
MISSING=""

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "FAIL: not inside the repository." >&2
  exit 2
}
quantic_dir="$repo_root/packages/quantic"
[ -d "$quantic_dir" ] || {
  echo "FAIL: $quantic_dir not found." >&2
  exit 2
}
cd "$quantic_dir" || exit 2

check_env() {
  MISSING=""

  orgs_json=$(sf org list --json 2>/dev/null) || {
    MISSING="salesforce-org-list"
    return
  }

  for org_alias in $ORGS; do
    if ! jq -e --arg alias "$org_alias" \
      '.result.scratchOrgs[] | select(.alias == $alias and .status == "Active")' \
      >/dev/null <<<"$orgs_json"; then
      MISSING="$MISSING org:$org_alias"
      continue
    fi

    env_file=".env/${org_alias}.env"

    if [ ! -f "$env_file" ]; then
      MISSING="$MISSING envfile:$env_file"
    elif ! grep -q "^${org_alias}_URL=." "$env_file"; then
      MISSING="$MISSING envvar:${org_alias}_URL"
    fi
  done

  MISSING="${MISSING# }"
}

check_env
if [ -z "$MISSING" ]; then
  echo "READY: both orgs exist and both env files have a URL. Nothing to provision."
  exit 0
fi

echo "Missing: $MISSING"
echo "Provisioning with 'pnpm run setup:examples'. This creates both scratch orgs,"
echo "deploys the components, and publishes the example communities."

if ! pnpm run setup:examples; then
  echo "FAIL: 'pnpm run setup:examples' exited non-zero. Read its output above." >&2
  echo "Common causes: expired Dev Hub auth, scratch org limit reached." >&2
  exit 1
fi

check_env
if [ -z "$MISSING" ]; then
  echo "READY: provisioned and verified."
  exit 0
fi

echo "FAIL: still missing after provisioning: $MISSING" >&2
echo "The setup script reported success but verification disagrees. Do not treat e2e" >&2
echo "failures as test bugs until this is resolved." >&2
exit 1
