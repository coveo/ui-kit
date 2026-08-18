---
status: Proposed

date: 2026-08-14
related:
  - https://turborepo.com/docs/reference/query
  - https://turborepo.com/docs/guides/skipping-tasks
  - https://github.com/vercel/vercel/blob/main/.github/AFFECTED_TESTING.md
  - https://github.com/vercel/turborepo/discussions/12949
  - https://github.com/coveo/ui-kit/pull/8226
  - https://coveord.atlassian.net/browse/KIT-5986
---

# Turbo-governed CI with a single affected-task calculation

## Context and Problem Statement

CI in this repository grew as a collection of independently written jobs. Three properties made it slow and hard to reason about.

Affectedness was recomputed everywhere. Each job that wanted to limit its work ran its own `turbo … --affected` (`turbo test --affected`, `turbo test:dts:ci --affected`, `turbo run publint --affected`), and each of those invocations re-derived the same answer from Git history. That forced `fetch-depth: 0` across the workflow, because [Turborepo requires the full base-to-head range in the checkout or it treats every package as changed](https://turborepo.com/docs/guides/skipping-tasks). It also meant every job paid the cost of the comparison, and different jobs could disagree about the comparison range.

Task execution bypassed Turbo. The shared `setup` action ran a build itself, driven by `skip-build` and `build-command` inputs, so "install dependencies" and "decide what to build" were the same step. Jobs that needed something other than the default build passed a command string into setup; jobs that needed no build passed `skip-build: 'true'` and then ran raw commands such as `pnpm run lint:check`, `pnpm --filter @coveo/atomic run validate:light-dom-styles`, and `npm run test:storybook -- --shard=…`. Work invoked that way is invisible to Turbo: it is not in the task graph, it is not cached, and it cannot be selected by affectedness.

Package selection was duplicated in YAML. Job-level `if:` guards, `--filter` flags, and bespoke helper scripts (`scripts/turbo/knip-affected.mjs`, `scripts/turbo/outdated-tasks.mjs`) each encoded part of "what should run for this change," so the dependency graph existed in two places: `turbo.json` and the workflow.

The end state we want is narrow and testable:

- every CI step is governed by Turbo, so the task graph is the only description of work;
- only affected tasks run;
- affectedness is calculated **once** per CI run, and each job cheaply intersects that answer with its own on-demand task DAG.

## Decision Drivers

- Turbo must be the single authority for affectedness; no second dependency graph in YAML or path filters.
- The expensive Git comparison should happen once per run and be reused by every job.
- Per-job selection must be fast, since it happens in every job.
- Jobs must remain independently retryable, so a job cannot assume another job's working tree.
- "Nothing affected" must be a success, not a failure or a silent skip of required checks.
- The migration must land in reviewable steps that each keep CI green.
- The solution should stay close to Turborepo and GitHub Actions primitives rather than introducing an orchestration service.
- Playwright E2E suites must be expressible as Turbo tasks so they participate in the same selection.

## Considered Options

### Option A: Keep per-job `turbo --affected`

- **Summary:** Leave each job responsible for its own affectedness by continuing to pass `--affected` to `turbo run`.
- **Pros:** No new abstractions. Turbo remains the authority. Jobs stay self-contained.
- **Cons:** Recomputes the same comparison in every job. Forces full-history checkouts repository-wide. Offers no way to make non-Turbo steps (raw Playwright, raw scripts) participate. Comparison range can drift between jobs, and [base-ref resolution in Actions has real failure modes](https://github.com/vercel/turborepo/issues/9320) that would then be replicated per job.

### Option B: Path-based change detection

- **Summary:** Use a filtering action such as [`tj-actions/changed-files`](https://github.com/tj-actions/changed-files) to decide which jobs run.
- **Pros:** Mature, widely used, cheap to compute, no Turbo invocation needed.
- **Cons:** Creates a second, hand-maintained model of the dependency graph that will drift from `turbo.json`. Path globs cannot express task-level inputs or transitive package dependencies, which is exactly what Turbo already computes. Cache validity and job selection would be derived from different sources.

### Option C: Repository-owned planner emitting a plan plus dynamic matrices

- **Summary:** Run `turbo query affected` once, normalize it with a TypeScript planner into an owned `plan.json`, and expand per-package and package×shard [dynamic matrices](https://docs.github.com/actions/using-jobs/using-a-matrix-for-your-jobs) from that plan. This is the shape [Vercel uses in its own monorepo](https://github.com/vercel/vercel/blob/main/.github/AFFECTED_TESTING.md), where a GraphQL affected query feeds repository scripts that apply E2E policy and chunk tests.
- **Pros:** Maximum scheduling control. Fine-grained fan-out. Policy is unit-testable in TypeScript. Strong precedent.
- **Cons:** Introduces a planner and an owned plan schema to maintain alongside Turbo's own graph. The job graph becomes dynamic – based on the turbo graph, which complicates required checks and branch protection. Skip propagation through `needs` requires careful `always() && (… == 'success' || … == 'skipped')` conditions in every consumer. Significantly more moving parts than the current problem justifies.

### Option D: Centralized affected calculation plus a shared manifest-based selection action

- **Summary:** Compute affected task identifiers once in a dedicated `affected` job via `turbo query affected`, publish them as JSON outputs, and change the jobs to invoke their turbo tasks using a `run-affected` action. The action discovers workspace package manifests, selects requested script names using package selectors, intersects the resulting task identifiers with the published affected identifiers, and invokes Turbo with the selected IDs.
- **Pros:** One expensive comparison per run. Per-job selection is a local workspace scan and filtering operation. No Git or Turbo dependency. Static job identities keep required checks unchanged. The selection behavior is shared and testable. An empty intersection is a natural no-op. Turbo remains responsible for dependency expansion and execution.
- **Cons:** Need to replicate parts of the task filtering logic of Turbo. It does not automatically describe every CI path, and adoption must remain explicit.

## Decision Outcome

Adopt the narrower form of **Option D**: calculate affected tasks once, then use a shared manifest-based selection action for standardized CI jobs that opt into the contract. Keep non-adopted or intentionally broad jobs explicit until they are migrated or receive a separate decision, allowing for a smooth multi-step migration.

The design has four parts:

**1. Affectedness is computed once.** `.github/actions/calculate-affected` runs one `turbo query affected` GraphQL query for an explicit `base-sha`/`head-sha` pair. The `affected` job publishes:

- `tasks` — affected task identifiers such as `@coveo/atomic#build` as a single-line JSON array;
- `projects` — affected package names, used for coarse job-level `if:` guards;
- `samples` — affected sample E2E task identifiers, used as the dynamic E2E matrix source.
- `fetch-depth` — the commit count of the compared range. 

The action verifies both commits before querying and writes a Markdown table of package, task, reason, and description to the job summary. The query requests [reason variants](https://turborepo.dev/docs/reference/query#understanding-affected-package-reasons) such as `TaskFileChanged` and `TaskDependencyTaskChanged`, so each run explains why tasks were selected.

**2. Setup no longer executes work.** The `setup` action installs mise-managed tooling, caches pnpm, and runs the frozen pnpm install. Its old `skip-build` and `build-command` inputs are gone. Build and test work is invoked by Turbo tasks or by an explicit specialized action after setup.

**3. Standardized jobs resolve task IDs without a Turbo dry run.** `.github/actions/run-affected` accepts:

- `affected-tasks` — the JSON array from the affected job; omitted or empty means that affected filtering is not applied, while an explicit `[]` selects no tasks;
- `tasks` — one or more Turbo target script names;
- `packages` — one or more package-name selectors;
- `arguments` — arguments passed to Turbo after `--`.

The resolver reads the package directories from `pnpm-workspace.yaml`, ignores workspace matches without a `package.json`, and reads each package's name and scripts. It then applies package selectors, selects matching script names, formats the candidates as `package#task`, intersects them with `affected-tasks` when that input is provided, and sorts the resulting newline-delimited task IDs.

Package selectors support exact package names, single `*` wildcards, and `!` negation; recursive `**` selectors are not part of the contract. A selector list with no positive entries starts with all workspace packages and subtracts the negated matches. For example, the CDN build selects `build` tasks while excluding `!@samples/*` and `!@coveo/ui-kit-sample-*`.

The action skips its execution step when the resolver returns no task IDs. Otherwise, `run-tasks.sh` invokes `pnpm exec turbo run` with those IDs and any additional arguments. Turbo remains responsible for resolving declared task dependencies, applying its cache, and honoring task outputs; the resolver does not materialize Turbo's dependency graph and does not invoke `--dry-run=json`.

The resolver has a development scenario script covering exact package matching, wildcards, multiple negations, multiple task names, an explicit empty affected list, and an unset affected list. These scenarios are focused behavioral checks rather than a repository-wide unit-test suite.

**4. Checkout depth follows the calculated range.** Jobs that receive precomputed affected tasks no longer need history and use `fetch-depth: 1`. The changeset merge guard, which does need the range, consumes the published `fetch-depth` instead of cloning everything.

### Rationale

Option D satisfies the central performance and consistency goal with fewer concepts than a planner and without making every job recompute affectedness. The expensive Git comparison happens once. Each adopted job repeats only a local workspace/package scan and string filtering, without needing the affected Git range. Turbo still owns the actual dependency ordering, caching, and declared outputs when selected tasks execute.

Option A was rejected because recomputation is inherent to it and it does not provide a shared contract for specialized or non-Turbo work. Option B was rejected because a path-glob model would diverge from `turbo.json` and make cache correctness and job selection answer to different sources. Option C remains a possible future direction if per-package or per-shard fan-out becomes necessary, but it introduces a planner, an owned schema, dynamic job identities, and skip-propagation complexity that the current workflow does not require.

The manifest-based resolver is deliberately narrower than a Turbo dry-run planner. It avoids requiring the selected runners and containers to run a second Turbo planning command or to parse Turbo's internal dry-run JSON. The trade-off is that the resolver's view of runnable script names and workspace membership must stay aligned with `pnpm-workspace.yaml` and package manifests. That boundary is documented rather than hidden behind a claim that the action owns the complete Turbo graph.

## Consequences

- **Positive:** Affectedness is calculated once per run and explained in the job summary. Adopted jobs reuse the same task identifiers and keep static job identities, so required checks remain stable. A relevant task can be added to a standardized job by selecting its Turbo script and package rather than duplicating shell selection logic. An explicit empty affected set produces a fast, successful no-op. Turbo continues to provide dependency ordering, caching, and output handling for executed tasks.
- **Negative:** The resolver duplicates a small amount of workspace and package metadata knowledge instead of asking Turbo for a task DAG. Resolver behavior can drift if workspace patterns or package scripts change in ways the action does not model. Adoption is partial, so workflow guards, direct Turbo invocations, helper scripts, and specialized E2E paths remain additional selection mechanisms. The resolver scenarios are ad hoc development checks, not a standard unit-test suite. Some jobs still require full history, and broad jobs such as CDN and preview builds intentionally do more work than the affected task list.
- **Neutral:** The affected calculation still requires a full-history checkout and `jq` to process Turbo query output. The `run-affected` action itself does not require `jq` or a Turbo dry run. Turbo's `outputs` declarations remain part of the cross-job contract, since downstream jobs reconstruct upstream artifacts from cache rather than from a shared working tree. Coarse project-level `if:` guards remain useful for static job scheduling but are not a replacement for task-level selection.
