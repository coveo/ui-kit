# Release process

This repository uses [Changesets](https://github.com/changesets/changesets) to manage versioning, changelogs, and npm publishing. Every push to `main` triggers the CD workflow (`.github/workflows/cd.yml`), which either opens a version PR or publishes packages.

## How a release works

```
Developer creates PR with a changeset file
  → PR merges to main
  → changesets/action detects pending changesets → opens a "Version Packages" PR
  → Team merges the "Version Packages" PR
  → changesets/action detects no pending changesets → runs `pnpm run release`
  → Packages are published to npm, git tags are created
  → Post-publish jobs run (Quantic promotion, typedoc, docs notification, CDN deploy)
```

## Adding a changeset

When you make changes that should appear in a release, add a changeset to your PR:

```bash
pnpm changeset
```

This will prompt you to select affected packages, choose a semver bump type (major/minor/patch), and write a summary. A markdown file is created in `.changeset/` describing the change.

**When to add a changeset:**

- Bug fixes, new features, breaking changes, dependency updates affecting public packages.

**When _not_ to add a changeset:**

- Documentation-only changes, CI/CD changes, test-only changes, internal tooling.

See [`.changeset/README.md`](../.changeset/README.md) for more details.

## Versioning

When the "Version Packages" PR is created (or updated), `changesets/action` runs `pnpm changeset version`, which:

1. Reads all pending changeset files in `.changeset/`.
2. Determines the appropriate semver bump for each affected package.
3. Updates `package.json` versions and inter-package dependency ranges.
4. Generates or prepends to each package's `CHANGELOG.md`.
5. Deletes the consumed changeset files.

All these changes are committed into the "Version Packages" PR for the team to review before merging.

## Publishing to npm

When the "Version Packages" PR is merged, the CD workflow runs `pnpm run release`, which:

1. **Builds** every package (`pnpm run build`).
2. **Publishes** every package to npm (`changeset publish`).

`changeset publish` will skip packages whose current version is already on the registry. After publishing, it creates a git tag for each newly published version (e.g., `@coveo/atomic@3.55.0`).

Publishing uses [**OIDC trusted publishing**](https://docs.npmjs.com/trusted-publishers) (npm provenance via the `id-token: write` permission) — no long-lived npm tokens are needed.

## Job structure: publish is isolated on purpose

The `release` job publishes to npm and does **nothing else**. Every other concern
lives in its own job that depends on it.

This is not stylistic. It makes "`release` succeeded" mean exactly "npm was
published to", which is what allows the CDN deployment to be gated on the publish
without also being gated on unrelated post-release work.

It used to be otherwise, and it caused a real outage. In run `31519447241`, a
post-publish telemetry step (`Read create-ui version`) failed *after*
`changeset publish` had already pushed to npm. That failed the whole `release`
job, which skipped `Upload commit artifacts to S3` — the only signal the CDN ever
receives. The published version got no CDN folder and returned 403 indefinitely.
Because a release only ever writes its own version folders, a later release does
not heal the gap. That mechanism is how `@coveo/atomic` 3.59.3 through 3.60.6
reached npm but never reached the CDN.

**If you need to do something after publishing, add a job, not a step.**

## Post-publish jobs

All post-publish jobs are gated on `published == 'true'` from the changesets step,
and each depends only on `release`:

| Job                      | Purpose                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `release-bookmark`       | Force-pushes the `release/v3` tag to the released commit                                                 |
| `create-ui-sentry`       | Uploads `@coveo/create-ui` source maps to Sentry                                                          |
| `quantic-prod`           | Promotes the Quantic SFDX package to production (requires the "Quantic Production" environment approval) |
| `typedoc-headless`       | Builds and uploads Headless API reference docs                                                           |
| `typedoc-headless-react` | Builds and uploads Headless React API reference docs                                                     |
| `docs-prod`              | Notifies the docs system of a new release (requires the "Docs Production" environment approval)          |
| `commit-artifact-upload` | Dispatches the CDN deployment to `coveo-platform/ui-kit-cd`                                              |
| `cdn-signal-guard`       | Fails the run if npm published but the CDN deployment was never dispatched                                |

These jobs check out the default ref, `github.sha`, which on a push to `main` **is**
the released commit: `changeset version` ran back in the "Version Packages" PR, so
`package.json` already carries the published versions at that commit.

## The `release/v3` tag

After a successful publish, `release-bookmark` force-pushes the `release/v3` **tag**
to the released commit:

```sh
git tag -f release/v3
git push origin refs/tags/release/v3 --force
```

It is a human-facing marker for "what was last released" and is **not** load-bearing.
Post-publish jobs deliberately do not check it out; doing so would make them wait
on, and fail with, a bookkeeping step.

## CDN deployment

After publishing, `commit-artifact-upload` dispatches a `deploy-commit`
repository dispatch to `coveo-platform/ui-kit-cd`, which builds the artifacts from
the commit, uploads them to `commits/<sha>/`, and updates pointer files.

The `channels` payload decides which pointers are updated:

| Situation             | `channels`        | Pointers written                                     |
| --------------------- | ----------------- | ---------------------------------------------------- |
| Regular merge to main | `private`         | `private/v<major>/`                                  |
| Release commit        | `private,preview` | the above, then `preview/`, then stable after approval |
| Hotfix branch push    | `hotfix`          | `v<major>/`, `v<minor>/`, `preview/v<major>/`         |

Version folders are derived from `package.json` at the deployed commit, so
`v3.60.4/` exists only if some deployment ran for a commit whose `atomic` version
was `3.60.4`. Stable is the only channel that writes the **patch** folder, and it
requires the `cdn-stable` environment approval in `ui-kit-cd`.

## Recovering a release that reached npm but not the CDN

Symptom: a version is on npm and in the changelog, but
`https://static.cloud.coveo.com/atomic/v<version>/index.esm.js` returns 403.

`cdn-signal-guard` should have failed the release run with these instructions. To
recover, run the **Redeploy CDN** workflow (`.github/workflows/redeploy-cdn.yml`):

| Input      | Value                                                    |
| ---------- | -------------------------------------------------------- |
| `ref`      | the release tag, e.g. `@coveo/atomic@3.60.4`, or its SHA  |
| `channels` | `private,preview`                                        |

Then approve the `cdn-stable` gate in `ui-kit-cd`. The workflow refuses any ref
whose CDN package versions are not on npm, so it cannot create a folder for a
version that does not exist.

If the deployment itself is what is broken, fix forward without moving the version:

```sh
git checkout -b fix/cdn-<something> @coveo/atomic@3.60.4
git cherry-pick <fix-sha>   # add NO changeset: the versions must not change
git push origin fix/cdn-<something>
```

then redeploy with `ref` set to that branch. The fixed artifacts land in the same
`v3.60.4/` folders.

Two things to avoid:

- **Do not re-run all jobs** on a release run. `release` would re-run, find no
  pending changesets, flip `published` to `false`, and degrade the dispatch to the
  `private` channel — which never writes version folders — while the run goes
  green. Re-run **failed jobs only**, or use **Redeploy CDN**.
- **Do not use the `hotfix` channel** to repair a published version. Its
  deployment config has no patch phase, so it cannot create `v3.60.4/`.

