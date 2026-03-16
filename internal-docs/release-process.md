# Release processes

This repository contains two release processes:

## 1. Canary releases

Canary releases publish packages to npm with the `@canary` tag on every commit entering the main branch via the merge queue.

**Purpose:**

1. Test the release pipeline continuously so scheduled releases don't surface surprises.
2. Allow implementers to test new features or fixes before a scheduled release.

Canary releases do not commit anything to the main branch — they bump versions and publish only within the ephemeral merge queue workspace. This allows them to run even if multiple features are merged in quick succession.

**Trigger:** `merge_group` event in `cd.yml` → `canary.yml`

## 2. Scheduled releases

Scheduled releases deploy stable versions of packages that are safe for implementers to use.

Every Wednesday, a scheduled release is triggered automatically. Additionally, a release can be triggered manually via the "CD" workflow dispatch.

When a scheduled release succeeds, a version bump commit is pushed directly to the main branch.

**Trigger:** `schedule` or `workflow_dispatch` event in `cd.yml` → `release.yml`

# Workflow architecture

`cd.yml` acts as a thin orchestrator registered as the npm trusted publisher for all `@coveo/*` packages. It routes events to reusable workflows:

- `schedule` / `workflow_dispatch` → `release.yml` (full release pipeline)
- `merge_group` → `canary.yml` (canary npm publish)

All npm publishing uses OIDC-based authentication (npm trusted publishing). The `id-token: write` permission in `cd.yml` enables short-lived credentials for each publish job.

# Versioning & publishing to NPM

Versions are determined based on [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

A commit determines its version by looking for the last scheduled release version and bumping it based on how breaking the changes are. This ensures implementers can safely update their dependencies.

When triggered, release processes execute [Turborepo tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks). Some tasks run at the root, some run on each individual package.

## `release:phase0` (lock the main branch)

This task is only run for the scheduled release.

The purpose of this task is to lock the main branch, preventing users from merging pull requests while the release is in progress.

This prevents new changes from getting merged between the release and the version bump commit. If changes were merged before the version bump, they would not be taken into account when calculating versions for subsequent releases.

## `release:phase1`

### Sub-phase 1: Bump package versions

This task is run individually on every package, in topological order (dependencies first, then dependants).

The purpose of this sub-phase is to update the `package.json` file of every package to contain their new version and their new dependencies. This serves multiple purposes:

1. NPM publishing — NPM determines the version from `package.json`.
2. pnpm workspace linking — pnpm creates symbolic links between packages when versions match.
3. Waterfall bumping — packages determine whether they need a bump by inspecting their own `package.json`.

On canary releases, the first ten digits of the commit hash are appended to the version:

- `1.2.3` → `1.2.3-pre.abcdef1234`

Additionally, this task updates the `CHANGELOG.md` file of each package.

### Sub-phase 2: build

Re-builds packages after bumping, since many packages embed their own version in compiled code.

## `release:phase2` (bump the root version)

This phase bumps the root `package.json` version. Used by the deployment-package `--version` attribute.

## `npm:publish` (publish to npm)

This task is run individually on every package, in topological order (dependencies first, then dependants).

Publishes packages to npm using OIDC-based authentication (npm trusted publishing).

- **Scheduled releases:** publishes to the `@latest` tag after CDN production deployment is approved.
- **Canary releases:** publishes to the `@canary` tag during the merge queue.

If a package version is already published, the task exits without error.

## `release:phase3` (commit version bumps)

This task is only run for the scheduled release.

Creates a version bump commit containing:

- Updated `package.json` files
- Updated `CHANGELOG.md` files
- Git tags for each bumped package version

This task also reverts the branch lock from `release:phase0`.

# Deploying

> [!NOTE]
> Probably out-of-date

After the release is completed on Git, GitHub and NPM, the release workflow triggers the deployment pipeline.

```mermaid
sequenceDiagram
   box blue Public network
   participant SFDC
   participant NPM
   participant GitHub-public
   end
   box purple VPC network
   participant GitHub-coveo
   participant DepPipeline
   participant AWS
   participant TeamJenkins
   end
   GitHub-public->>+GitHub-coveo: Continue GitHub workflow on Coveo Hosted Runner
   GitHub-coveo-)DepPipeline: Trigger Deployment Pipeline
   GitHub-coveo->>+GitHub-public: Continue GitHub workflow on GitHub Hosted runner
   activate GitHub-public
   DepPipeline->>DepPipeline: Do the usual checks
   DepPipeline->>+AWS: Deploy files to S3
   DepPipeline->>+TeamJenkins: Dispatch Jenkins Job
   DepPipeline->>+AWS: Invalidate CloudFront Cache
   Note right of GitHub-public: Wait for ✅
   deactivate GitHub-public
   TeamJenkins->>+GitHub-public: Approve Production GitHub Environment usage
   GitHub-public->>+NPM: Publish packages to @latest
   GitHub-public->>+SFDC: Promote package to latest
```
