# Release process

This repository uses [Changesets](https://github.com/changesets/changesets) to manage versioning, changelogs, and npm publishing. Every push to `main` or `v3` triggers the CD workflow (`.github/workflows/cd.yml`), which either opens a version PR or publishes packages.

## Two release lines until the v4 GA

`v3` was cut from `main` on November 25, 2026 ([KIT-6480](https://coveord.atlassian.net/browse/KIT-6480)). Until the v4 GA:

- `v3` publishes every package except the Converse SDK, which `v3` still holds as `@coveo/thermidor`: the 3.x releases, and Auth, Bueno, coveo.analytics, create-ui and Relay. Its copy of `cd.yml` moves the `release/v3` tag and runs the post-publish jobs and the CDN deployment described below.
- `main` publishes the Converse SDK only, as `@coveo/converse` (formerly `@coveo/thermidor`). Every other package is in the `ignore` list of its `.changeset/config.json`, so their changesets, v4 majors included, wait on `main` until GA. `main`'s copy of `cd.yml` has no post-publish jobs and no CDN deployment.
- `utils/ci/changeset-major-guard.mjs` refuses the changesets that the target branch cannot ship.

Before the first v4 prerelease and again before GA, `v3` is merged into `main` through a pull request. Keep `main`'s `cd.yml` and `.changeset/config.json` in that merge: the guard fails a pull request whose config names another `baseBranch` than its target. Also keep `main`'s `utils/ci/changeset-major-guard.mjs` and its test whenever `v3`'s copy differs: the guard runs from the merged head, so `v3`'s older copy would drop the checks written for this merge.

## How a release works

```
Developer creates PR with a changeset file
  → PR merges to main or v3
  → changesets/action detects pending changesets → opens a "version packages (<branch>)" PR
  → Team merges the version PR
  → changesets/action detects no pending changesets → runs `pnpm run release`
  → Packages are published to npm, git tags are created
  → On v3: post-publish jobs run (Quantic promotion, typedoc, docs notification, CDN deploy)
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

When the version PR is created (or updated), `changesets/action` runs `pnpm changeset version`, which:

1. Reads all pending changeset files in `.changeset/`.
2. Determines the appropriate semver bump for each affected package.
3. Updates `package.json` versions and inter-package dependency ranges.
4. Generates or prepends to each package's `CHANGELOG.md`.
5. Deletes the consumed changeset files. On `main`, it keeps the changesets of the packages in the `ignore` list.

All these changes are committed into the version PR for the team to review before merging.

## Publishing to npm

When the version PR is merged, the CD workflow runs `pnpm run release`, which:

1. **Builds** every package (`pnpm run build`).
2. **Publishes** the packages to npm (`changeset publish`).

`changeset publish` will skip packages whose current version is already on the registry, and the packages in the `ignore` list, so `main` never publishes a paused package. After publishing, it creates a git tag for each newly published version (e.g., `@coveo/atomic@3.55.0`).

The action publishes only when `.changeset` holds no changeset file. On `main`, the changesets of the paused packages stay until GA, so when nothing else is left to version, the release job's "Hold back the changesets of the paused packages" step removes them from its checkout before the action runs. Publishing commits nothing, so they stay in the repository.

Publishing uses [**OIDC trusted publishing**](https://docs.npmjs.com/trusted-publishers) (npm provenance via the `id-token: write` permission) — no long-lived npm tokens are needed.

## The `release/v3` tag

After a successful publish from `v3`, the release job moves the `release/v3` tag to the released commit:

```bash
git tag -f release/v3
git push origin refs/tags/release/v3 --force
```

The tag marks the latest 3.x release. Downstream jobs (Quantic production promotion, typedoc generation, docs notification) check out `release/v3` so they operate on the exact code that was just published. `main` does not move it.

## Post-publish jobs

The post-publish jobs run on `v3`. They are gated on `published == 'true'` from the changesets step and check out `release/v3`:

| Job                      | Purpose                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `quantic-prod`           | Promotes the Quantic SFDX package to production (requires the "Quantic Production" environment approval) |
| `typedoc-headless`       | Builds and uploads Headless API reference docs                                                           |
| `typedoc-headless-react` | Builds and uploads Headless React API reference docs                                                     |
| `docs-prod`              | Notifies the docs system of a new release (requires the "Docs Production" environment approval)          |

`sentry-create-ui` uploads the create-ui source maps to Sentry when a release publishes create-ui. It runs on `v3` until GA.

## CDN deployment

After publishing from `v3`, the CD workflow dispatches a `deploy` event to the `coveo-platform/ui-kit-cd` repository, which handles CDN deployment (S3 upload, CloudFront invalidation). `main` does not dispatch until GA: its `package.json` files keep 3.x versions while they carry v4 work.
