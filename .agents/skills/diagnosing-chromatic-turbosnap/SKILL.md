---
name: diagnosing-chromatic-turbosnap
description: Diagnoses Chromatic TurboSnap full rebuilds, bailout reasons, and unexpected snapshot costs in Coveo UI Kit. Use when Chromatic reports changedStorybookFiles, missing commits, all stories being captured, TurboSnap bailouts, or unusually high visual-test usage.
license: Apache-2.0
compatibility: Requires pnpm, GitHub CLI access for CI logs, and a built Atomic Storybook to run dependency traces.
metadata:
  author: coveo
  version: "1.0.0"
---

# Diagnosing Chromatic TurboSnap

Use the build's diagnostics and CI log as the source of truth. Do not change `untraced` or disable TurboSnap until the exact bailout reason and changed file are established.

## Start from a Chromatic build number

Run the build-number tracer from the repository root:

```sh
node .agents/skills/diagnosing-chromatic-turbosnap/scripts/trace-chromatic-build.mjs 1498
```

It emits JSON containing:

- Chromatic build URL and commit URL
- Candidate GitHub Actions run and exact Chromatic job URLs
- Filtered Chromatic CLI diagnostics from every candidate job
- `UI Tests` status URLs and `Storybook Publish` URLs
- Derived `/.chromatic/` diagnostic URLs

Requirements: authenticated `gh` access to `coveo/ui-kit` and network access to the public Chromatic build page. The script does not mutate GitHub or Chromatic.

When the output has multiple candidates or no job whose log initialized the requested build, report that ambiguity. This occurs for skipped merge-queue builds and retries sharing a commit SHA.

## Interpret the trace

| Signal | Meaning | Next action |
| --- | --- | --- |
| `Missing commit detected` | TurboSnap fell back to an older build and expanded the Git range. | Record both missing and fallback build/commit. Inspect whether the fallback includes a global Storybook file. |
| `Changed Storybook Files` | A `.storybook` file or imported dependency changed. | A full rebuild is expected; inspect the exact file. |
| `chromatic --skip` / `Skipping build` | The workflow created passing Chromatic statuses without building Storybook. | Do not count the action as a visual capture. Preserve it on merge-group commits when statuses are required. |
| `changedPackageFiles` | A package control file or unresolved dependency changed. | Check lockfile consistency and actual Storybook consumption. |
| `changedExternalFiles` | An `externals` glob matched. | Validate the glob and retain it only for files that affect rendering. |
| `missingStatsFile` | The Storybook dependency graph is unavailable. | Rebuild Storybook with `--stats-json`. |

`UI Tests` and `UI Review` are required checks for `main`. Keep `chromatic --skip` on merge-group events so those statuses are present on the merge-queue SHA. Do not remove it solely to reduce TurboSnap costs.

Never mark `.storybook/main.ts`, `.storybook/preview.ts`, or another global Storybook input as `untraced` merely because one edit seems non-functional. Chromatic cannot safely link a configuration change to individual stories.

## Trace a source file locally

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

Use `--mode expanded` to inspect intermediate imports. Use `--untraced <path>` only as a local experiment to identify a dependency edge; do not commit it before assessing visual-regression risk.

## References

- [Reproducible trace workflow](references/reproducing-build-traces.md)
