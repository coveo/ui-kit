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
4. Generates or appends to each package's `CHANGELOG.md`.
5. Deletes the consumed changeset files.

All these changes are committed into the "Version Packages" PR for the team to review before merging.

## Publishing to npm

When the "Version Packages" PR is merged, the CD workflow runs `pnpm run release`, which:

1. **Builds** every package (`pnpm run build`).
2. **Publishes** every package to npm (`changeset publish`).

`changeset publish` will skip packages whose current version is already on the registry. After publishing, it creates a git tag for each newly published version (e.g., `@coveo/atomic@3.55.0`).

Publishing uses **OIDC trusted publishing** (npm provenance via the `id-token: write` permission) — no long-lived npm tokens are needed.

## The `release/v3` bookmark

After a successful publish, the CD workflow force-pushes the current `main` HEAD to the `release/v3` branch:

```yaml
git push origin HEAD:refs/heads/release/v3 --force
```

This branch acts as a bookmark pointing to the latest released commit. Downstream jobs (Quantic production promotion, typedoc generation, docs notification) check out `release/v3` so they operate on the exact code that was just published.

## Post-publish jobs

All post-publish jobs are gated on `published == 'true'` from the changesets step and check out `release/v3`:

| Job                      | Purpose                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `quantic-prod`           | Promotes the Quantic SFDX package to production (requires the "Quantic Production" environment approval) |
| `typedoc-headless`       | Builds and uploads Headless API reference docs                                                           |
| `typedoc-headless-react` | Builds and uploads Headless React API reference docs                                                     |
| `docs-prod`              | Notifies the docs system of a new release (requires the "Docs Production" environment approval)          |

## CDN deployment

After publishing, the CD workflow dispatches a `deploy` event to the `coveo-platform/ui-kit-cd` repository, which handles CDN deployment (S3 upload, CloudFront invalidation).
