---
status: Proposed
date: 2026-08-21
related:
  - pnpm-workspace.yaml
  - AGENTS.md
---

# Classify workspace projects by primary responsibility

## Context and Problem Statement

The ui-kit monorepo uses pnpm workspaces for more than publishable libraries. The `packages/` directory currently contains reusable libraries, distributed command-line tools, runnable applications, mock services, test harnesses, repository tooling, and project templates. Although every workspace has a `package.json`, these projects have different purposes, operating models, ownership boundaries, and release expectations.

The existing `samples/` and `utils/` directories already establish that a workspace does not need to live under `packages/`. Without a broader convention, contributors must inspect manifests and source trees to understand a project's role, and new workspaces continue to accumulate under `packages/` by default.

We need a stable top-level taxonomy that communicates how each workspace is primarily used and makes `packages/` the authoritative home for the repository's intended reusable package surface.

## Decision Drivers

- A project's location should communicate its primary responsibility to contributors.
- The convention should distinguish the intended reusable package surface from runnable applications, validation suites, examples, repository automation, and source templates.
- Internal technical reuse alone should not qualify a workspace for `packages/`; its primary responsibility remains decisive.
- Tightly coupled supporting workspaces should remain colocated when separating them would obscure or disrupt the public package they exist to build.
- The taxonomy should provide clear placement rules without creating a generic catch-all directory.
- Existing projects should be movable incrementally to limit disruption to CI, ownership rules, links, and Git history.
- Workspace tooling should support all citizen classes without assuming that every workspace lives under `packages/`.

## Considered Options

### Option A: Classify top-level workspaces by primary responsibility

- **Summary:** Establish `packages/`, `apps/`, `tests/`, `samples/`, `tools/`, and `templates/` as workspace citizen classes. Classify each project according to how it is primarily consumed or operated.
- **Pros:** Paths communicate intent; `packages/` becomes the authoritative package destination; each class can have appropriate ownership and CI behavior; the model accommodates future growth without a catch-all.
- **Cons:** Introduces more top-level directories; some projects require judgment when they serve multiple roles; existing path-aware tooling must be generalized.

### Option B: Separate published packages from internal workspaces

- **Summary:** Reserve `packages/` for workspaces published to npm and move every private workspace under `internal/`.
- **Pros:** Simple rule based on manifest metadata; creates an obvious publication boundary; requires few top-level directories.
- **Cons:** Separates tightly coupled private build workspaces from the public packages they support; mixes applications, tests, tools, services, and templates in a new catch-all; a visibility change could require moving an otherwise unchanged project.

### Option C: Keep all workspaces under `packages/` with naming and documentation conventions

- **Summary:** Preserve the current layout and document each project's role in a directory index or naming convention.
- **Pros:** Avoids path migrations and tooling changes; retains existing links and Git history paths.
- **Cons:** The directory remains semantically mixed; contributors must consult secondary documentation; naming prefixes duplicate information that directories could express; future accumulation remains unchecked.

### Option D: Nest role groups under `packages/`

- **Summary:** Introduce groups such as `packages/libraries/`, `packages/apps/`, and `packages/tools/`.
- **Pros:** Keeps all workspaces under one parent while making roles visible; permits group-level tooling and ownership rules.
- **Cons:** Moves every existing package, including the stable public package surface; creates unnecessary path depth; causes the greatest migration churn for little additional clarity over top-level citizen classes.

## Decision Outcome

Adopt Option A: classify top-level workspace projects by their primary responsibility.

The supported citizen classes are:

| Directory    | Primary responsibility                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| `packages/`  | Libraries, plugins, and command-line tools forming the intended reusable package surface |
| `apps/`      | Runnable applications, services, previews, and playgrounds                               |
| `tests/`     | Cross-project validation suites, test harnesses, and reusable test infrastructure        |
| `samples/`   | Consumer-facing examples that demonstrate supported public APIs                          |
| `tools/`     | Internal build, documentation, repository, and CI automation                             |
| `templates/` | Independently managed source trees copied or transformed by generators                   |

A project belongs to the class that describes its primary interface:

- If it is intended to be distributed and reused as part of the repository's package surface, it is a package.
- If maintainers start or deploy it as an application or service, it is an app.
- If its primary purpose is validating other projects or supporting their tests, it is a test workspace.
- If its primary purpose is teaching consumers how to use public APIs, it is a sample.
- If it automates repository maintenance, build, release, or CI operations, it is a tool.
- If its contents are source material for generated projects, it is a template.

The presence of a `package.json`, internal imports, and inclusion in the workspace graph do not make a project part of the intended package surface. Workspaces under `packages/` are normally distributable; publication and versioning continue to be governed by package manifests and Changesets.

Package-specific tests, tools, fixtures, and templates remain colocated with their owning package. A private support workspace may remain under `packages/` when it is structurally tied to a colocated public package, as `@coveo/atomic-angular-builder` is to `@coveo/atomic-angular`. Other supporting workspaces use the citizen class matching their primary responsibility.

### Rationale

Option A addresses the underlying ambiguity by distinguishing intended package artifacts from internal infrastructure. A mock library used across the monorepo belongs in `tests/` when its purpose is test support, and an internal TypeDoc plugin belongs in `tools/` when its purpose is repository documentation. The private Angular builder remains in `packages/` because separating it from the public Angular package it builds would break their structural and conceptual colocation.

The additional top-level directories carry some classification and tooling cost, but that cost produces useful information at the point of discovery. Option B is initially simpler but recreates the current problem inside `internal/`. Option C records the ambiguity instead of resolving it. Option D achieves similar clarity while disrupting every established package path.

## Consequences

- **Positive:** Contributors can infer a workspace's primary role and expected operating model from its path.
- **Positive:** `packages/` becomes the authoritative destination for the repository's intended reusable package surface.
- **Positive:** Internal reuse no longer causes test and documentation infrastructure to be mistaken for package artifacts.
- **Positive:** CI, ownership, and release policies can target project classes explicitly, with a narrow documented colocation exception.
- **Positive:** New workspace placement has a durable decision rule, reducing growth of semantically mixed directories.
- **Negative:** Workspace discovery, catalog generation, CI path filters, ownership rules, and other path-aware tooling must recognize multiple roots.
- **Negative:** Moving existing projects changes repository paths and may disrupt links, path filters, and local contributor habits.
- **Negative:** Projects with several responsibilities require maintainers to identify a primary interface.
- **Neutral:** All JavaScript workspaces continue to use `package.json`, pnpm, and Turbo regardless of their top-level directory.
- **Neutral:** Moving an internal workspace does not require changing its package name or dependency relationships.

## Implementation and Follow-up

Adopt the taxonomy immediately for newly created workspaces. Migrate existing workspaces incrementally rather than requiring a single repository-wide move.

Start with projects whose primary responsibility is unambiguous:

- Move `packages/relay-playground` to `apps/relay-playground`.
- Move `packages/pkg-new-template` to `apps/pkg-new-template`.
- Move `packages/mock-converse-api` to `apps/mock-converse-api`.
- Move `packages/atomic-cdn-smoke` to `tests/atomic-cdn-smoke`.
- Move `packages/atomic-a11y` to `tests/atomic-a11y`.
- Move `packages/platform-mock-api` to `tests/platform-mock-api`.
- Move `packages/documentation` to `tools/documentation`.
- Move `packages/create-atomic-template` to `templates/create-atomic`.

Keep `packages/atomic-angular` under `packages/`: its private builder workspace is structurally tied to the public `@coveo/atomic-angular` package located inside it. Evaluate future exceptions against this colocation requirement rather than treating internal reuse as sufficient.

Before the first migration:

1. Generalize workspace and package discovery so scripts can consume the configured workspace roots rather than assuming `packages/`.
2. Update catalog generation, CI path triggers, Knip, Vitest, area ownership rules, and explicit workflow paths for the new roots.
3. Define whether `tools/` supersedes the existing `utils/` directory, then migrate repository automation separately if appropriate.
4. Add lightweight validation that recognizes the supported roots and flags new top-level workspaces that do not follow the taxonomy.
