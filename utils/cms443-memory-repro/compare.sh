#!/usr/bin/env bash
# CMS-443 — before/after orchestrator.
# For each git ref: create an isolated worktree, install + build @coveo/headless,
# run repro.mjs against its dist/esm, collect JSON. Then print a before/after summary.
#
# Usage: ./compare.sh
# Requires: the repo at $REPO, repro.mjs next to this script, pnpm + node --expose-gc.

set -euo pipefail

# Resolve the repo root from this script's location (utils/cms443-memory-repro/compare.sh).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPRO="$SCRIPT_DIR/repro.mjs"
WORK="${KIROCREW_SCRATCH:-${TMPDIR:-/tmp}}/cms443-compare"
OUT="$WORK/results"
mkdir -p "$OUT"

# ref label -> git ref
# The fix is merged and released (@coveo/headless 3.57.0); the per-finding fix branches were
# deleted after merge, so the before/after uses commit SHAs on main instead of branch tips.
# The chain is strictly linear (each SHA is an ancestor of the next), so each column is
# cumulative — it contains every fix to its left plus its own. This preserves the independence
# diagonal: each finding flips FIXED only in its own column.
#   before            = main just BEFORE #8479 (none of the three findings fixed)
#   after-f1          = #8479 merged (F1 only)
#   after-f2          = #8480 merged (F1+F2)
#   after-f3-ssrnext  = #8481 merged (F1+F2+F3a, per-request token on ssr-commerce-next)
#   after-f3          = #8506 merged = @coveo/headless@3.57.0 (adds F3b ssr-commerce + F3c ssr-next search)
REFS=(
  "before:612cd2b608212ce149dbf57efb4d04fee14adeaa"
  "after-f1:fa2e9de00d868bb4c10215fffcfa09c4acf7d2af"
  "after-f2:818bdf001edfdafa887ea49c0880f3cb2ce7e9ce"
  "after-f3-ssrnext:01434bcbd3ee4e6545fa874bb0f0f5e4d0b46ef8"
  "after-f3:4f82bb4f0d26c87c02494156109709e68905ad5f"
)

echo "==> Fetching refs + the two comparison SHAs"
git -C "$REPO" fetch --quiet origin
# The comparison points are bare commit SHAs, not branch tips, so fetch each explicitly —
# a generic `git fetch origin` does not guarantee an unreferenced commit is present locally.
for entry in "${REFS[@]}"; do
  sha="${entry#*:}"
  git -C "$REPO" cat-file -e "$sha^{commit}" 2>/dev/null || \
    git -C "$REPO" fetch --quiet origin "$sha" 2>/dev/null || true
done

build_ref() {
  local label="$1" ref="$2"
  local wt="$WORK/$label"
  echo "==> [$label] worktree at $ref"
  if [ -d "$wt" ]; then
    git -C "$REPO" worktree remove --force "$wt" 2>/dev/null || rm -rf "$wt"
  fi
  git -C "$REPO" worktree add --quiet --detach "$wt" "$ref"

  echo "==> [$label] pnpm install"
  ( cd "$wt" && pnpm install --frozen-lockfile --silent 2>/dev/null ) || \
    ( cd "$wt" && pnpm install --silent )

  echo "==> [$label] build @coveo/headless"
  ( cd "$wt" && pnpm turbo run build --filter=@coveo/headless >/dev/null 2>&1 )

  echo "==> [$label] run repro"
  ( cd "$wt/packages/headless" && node --expose-gc "$REPRO" "$wt/packages/headless/dist/esm" --json ) \
    > "$OUT/$label.json" 2>"$OUT/$label.err" || {
      echo "!! [$label] repro failed; see $OUT/$label.err"; cat "$OUT/$label.err" >&2;
    }
}

for entry in "${REFS[@]}"; do
  label="${entry%%:*}"; ref="${entry#*:}"
  build_ref "$label" "$ref"
done

echo ""
echo "===================== CMS-443 before/after ====================="
node - "$OUT" <<'NODE'
import {readFileSync, readdirSync} from 'node:fs';
const dir = process.argv[2];
const load = (f) => { try { return JSON.parse(readFileSync(`${dir}/${f}`,'utf8')); } catch { return null; } };
const labels = ['before','after-f1','after-f2','after-f3-ssrnext','after-f3'];
const data = Object.fromEntries(labels.map(l => [l, load(`${l}.json`)]));

const row = (name, fn) => {
  const cells = labels.map(l => data[l] ? fn(data[l]) : 'n/a');
  console.log(name.padEnd(34) + cells.map(c => String(c).padStart(22)).join(''));
};
console.log('metric'.padEnd(34) + labels.map(l=>l.padStart(22)).join(''));
console.log('-'.repeat(34 + 22*labels.length));
row('F1 fetch KB/call',     d => d.f1.fetchStaticState_perIterKB);
row('F1 build alive',       d => d.f1.build_enginesStillAlive);
row('F1 build finalized',   d => d.f1.build_enginesFinalized);
row('F1 hydrate updated',   d => d.f1.hydrate_liveEngineReceivedRotatedToken);
row('F1 verdict',           d => d.f1.verdict.split(' ')[0]);
row('F2 firstTokenCached',  d => d.f2.firstTokenStillCachedAfterFlood);
row('F2 memoizationWorks',  d => d.f2.memoizationWorks);
row('F2 verdict',           d => d.f2.verdict.split(' ')[0]);
row('F3a perReqApplied',    d => d.f3_ssrNext.available ? d.f3_ssrNext.perRequestTokenApplied : 'n/a');
row('F3a sharedNotMutated', d => d.f3_ssrNext.available ? d.f3_ssrNext.sharedDefinitionNotMutated : 'n/a');
row('F3a verdict (ssr-next commerce)', d => d.f3_ssrNext.verdict.split(' ')[0]);
row('F3b perReqApplied',    d => d.f3_ssrCommerce.perRequestTokenApplied);
row('F3b navCtxApplied',    d => d.f3_ssrCommerce.perRequestNavigatorContextApplied);
row('F3b sharedNotMutated', d => d.f3_ssrCommerce.sharedDefinitionNotMutated);
row('F3b verdict (ssr-commerce)', d => d.f3_ssrCommerce.verdict.split(' ')[0]);
row('F3c perReqApplied',    d => d.f3_ssrNextSearch.available ? d.f3_ssrNextSearch.perRequestTokenApplied : 'n/a');
row('F3c sharedNotMutated', d => d.f3_ssrNextSearch.available ? d.f3_ssrNextSearch.sharedDefinitionNotMutated : 'n/a');
row('F3c verdict (ssr-next search)', d => d.f3_ssrNextSearch.verdict.split(' ')[0]);
NODE
echo "================================================================"
echo "Raw JSON per ref under: $OUT"
