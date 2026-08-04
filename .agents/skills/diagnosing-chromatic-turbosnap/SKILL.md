---
name: diagnosing-chromatic-turbosnap
description: Diagnoses Chromatic TurboSnap full rebuilds, bailout reasons, and unexpected snapshot costs in Coveo UI Kit. Use when Chromatic reports changedStorybookFiles, missing commits, all stories being captured, TurboSnap bailouts, or unusually high visual-test usage.
license: Apache-2.0
compatibility: Requires pnpm, GitHub CLI access for CI logs, and a built Atomic Storybook to run dependency traces.
metadata:
  author: coveo
  version: "1.0.0"
---

# Diagnosing Chromatic Turbosnap

Use the build's diagnostics and CI log as the source of truth. Do not change `untraced` or disable TurboSnap until the exact bailout reason and changed file are established.

## 1. Classify the build

Record the build number, branch, browser snapshot count, TurboSnap count, bailout reason, and the GitHub Actions run URL. The Chromatic build page may expose a `.chromatic/` diagnostic URL; use it when authorized. If access is unavailable, retrieve the corresponding Actions job log with `gh`.

Look for these messages:

- `Missing commit detected`
- `Found <n> changed files`
- `Changed Storybook Files`
- `Found a Storybook config change in <path>`
- `TurboSnap disabled due to file change`

The last two identify the immediate bailout. A missing commit explains why an old change can recur across otherwise unrelated builds.

## 2. Verify baseline ancestry

If the log reports a missing commit, capture both the missing commit and the fallback build/commit. Chromatic uses the fallback as an ancestor, so it considers every Git change between that older commit and the current build.

For example, a direct Storybook configuration change made after the fallback can cause every subsequent affected branch to bail—even when its own change is unrelated.

Check whether the missing build came from a non-durable CI context:

- GitHub `merge_group` commits are ephemeral.
- `chromatic --skip` publishes the `UI Tests`, `UI Review`, and `Storybook Publish` statuses.
- The durable `main` baseline is produced by `.github/workflows/cd.yml` after a real `push` to `main`.

`UI Tests` and `UI Review` are required checks for `main`. Keep `chromatic --skip` on merge-group events so those statuses are present on the merge-queue SHA. Do not remove it solely to reduce TurboSnap costs; investigate the baseline-selection behavior separately.

## 3. Trace a specific changed file

Build Atomic's Storybook with dependency statistics if `dist-storybook/preview-stats.json` is absent or stale:

```sh
pnpm exec turbo run build:storybook --filter=@coveo/atomic -- --stats-json
```

Then trace the file from Atomic's package directory:

```sh
pnpm exec chromatic trace \
  --stats-file dist-storybook/preview-stats.json \
  --mode compact \
  .storybook/main.ts
```

Use `--mode expanded` to inspect intermediate imports, or trace several changed files together. Add `--untraced <path>` only as a local experiment to identify a dependency edge; do not commit that exclusion before assessing visual-regression risk.

## 4. Interpret the bailout

| Bailout reason | Meaning | Next action |
| --- | --- | --- |
| `changedStorybookFiles` | A `.storybook` file or one of its imports changed. | Inspect the exact path. A direct configuration change requires a full rebuild. If it appears only through an old fallback, repair baseline ancestry instead. |
| `changedPackageFiles` | A package control file or unresolved dependency changed. | Check lockfile consistency and whether the package is genuinely consumed by Atomic Storybook. |
| `changedExternalFiles` | An `externals` glob matched. | Validate the glob and retain it only for files that can affect rendered output. |
| `invalidChangedFiles` or `noAncestorBuild` | Git history or baseline ancestry is unavailable. | Verify a full checkout and eliminate non-durable Chromatic builds. |
| `missingStatsFile` | The Storybook dependency graph is unavailable. | Rebuild Storybook with `--stats-json` and confirm the stats file exists. |
| `rebuild` | The commit and branch match an existing baseline. | Confirm whether the rerun was intentional before using `--force-rebuild`. |

Never mark `.storybook/main.ts` or `.storybook/preview.ts` as `untraced` merely because the edit is non-functional. Chromatic cannot safely link a configuration change to individual stories. A real configuration edit should trigger one full rebuild.

## 5. Recover and validate

1. Allow the CD workflow to publish a build for a durable `main` commit.
2. Rebase long-lived branches that were created before that durable baseline.
3. On a new or rebased pull request, confirm the log does not show `Missing commit detected` and reports affected story files instead of a config bailout.
4. Review the next usage export: ordinary changes should show TurboSnaps and far fewer captured Chrome snapshots.

## Reporting checklist

Before closing an investigation, report:

- Build number, branch, and snapshot counts
- Exact bailout reason and changed file
- Baseline and fallback commit, if one was used
- Whether the trigger was a real visual dependency or stale ancestry
- The remediation and the CI/log evidence that verifies it
