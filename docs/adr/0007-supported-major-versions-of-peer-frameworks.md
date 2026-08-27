---
status: Proposed
date: 2026-08-25
related:
  - https://coveord.atlassian.net/browse/KIT-4735
  - https://coveord.atlassian.net/browse/KIT-5980
  - docs/adr/0003-catalog-first-dependency-management-with-automated-reporting.md
  - docs/adr/0005-peer-dependency-compatibility-catalog.md
  - https://coveord.atlassian.net/browse/KIT-5994
  - https://github.com/coveo/ui-kit/pull/8228
---

# Bound peer dependency ranges to validated framework majors

## Context and Problem Statement

This monorepo publishes wrappers around third-party frameworks (`@coveo/atomic-angular`, `@coveo/atomic-react`, `@coveo/headless-react`) plus core packages that declare a TypeScript peer. Each advertises which major versions it works with, and today each does so differently:

| Peer | Declared range | Style | In catalog |
| --- | --- | --- | --- |
| `@angular/common`, `@angular/core` | `14 - 21` | Hyphen range | No |
| `react`, `react-dom`, `@types/react`, `@types/react-dom` | `^18 \|\| ^19` | Caret union | Yes |
| `typescript` | `>=5.0.0` | Open lower bound | Yes |
| `pino-pretty` | `^6.0.0 \|\| ^10.0.0 \|\| ^11.0.0 \|\| ^13.0.0` | Sparse caret union | No |

With no rule for choosing bounds, ranges drift in both directions unnoticed. The Angular range claims support for majors 14 and 15, which cannot resolve: `@coveo/atomic` and `@coveo/headless` declare a `typescript: '>=5.0.0'` peer, while Angular's `@angular/compiler-cli` caps TypeScript at `<4.9` for v14 and `<5.0` for v15. The same range excludes Angular 22, which is `latest` on npm.

Both errors survived because nothing tests the bounds. A consumer sample exists at `samples/atomic/search-commerce-angular` and is built in CI, but it resolves `@angular/*` from `catalog:`, so exactly one Angular version is exercised — the single value pinned for the whole workspace.

This ADR governs the range declared in `peerDependencies` for every framework peer, and when that range may be narrowed.

## Decision Drivers

- Never advertise a range that cannot produce a working install.
- Never break an install that works today without a major version.
- Assert compatibility only with majors that CI has exercised.
- Give consumers an install-time signal when they move outside the validated range.
- Express every range in one consistent, reviewable style.
- Follow the catalog-first policy so ranges do not bypass the catalog.

## Considered Options

### Option A: Status quo — per-package, ad hoc ranges

- **Summary:** Leave each package to declare its own range in its own style.
- **Pros:** No work.
- **Cons:** Reproduces the drift that motivated this ADR. Nothing keeps a range honest.

### Option B: Narrow each range to the majors upstream still supports

- **Summary:** Track each framework's own support window, dropping majors from the range as they leave upstream LTS.
- **Pros:** Smallest advertised surface. The range always reflects a currently maintained framework version.
- **Cons:** Narrowing a range is breaking for consumers, and upstream cadences do not match ours. Angular ships a major every six months while `@coveo/atomic-angular` versions along the Atomic line, so this would mean shipping breaking changes in patch or minor releases. It also conflates "upstream stopped maintaining this" with "this cannot work": Angular 16 through 19 resolve and build today.

### Option C: A range bounded by what CI validates

- **Summary:** The range states technical compatibility, bounded below and above by what CI exercises, and moves only at a major of the affected package.
- **Pros:** Narrowing to the technical floor drops only majors that could never resolve, so it ships as a bug fix. The range asserts only what was measured. Consumers outside it get a peer warning naming the problem.
- **Cons:** The range stays wider than the set of majors we would choose to support, for as long as a major release is away.

### Option D: A range with an open upper bound

- **Summary:** As Option C, but with no ceiling (`>=16`).
- **Pros:** No edit when a framework ships a major.
- **Cons:** Asserts compatibility with majors that do not exist yet. A consumer on a future incompatible major gets a broken build rather than a warning.

## Decision Outcome

Option C. Concretely:

1. **Every shared peer range lives in `catalogs.peer-compatibility`** (ADR-0005) and is referenced as `catalog:peer-compatibility`. This extends that catalog beyond TypeScript and React to Angular and any future framework peer.
2. **Every framework peer range has an explicit lower and upper bound.** Contiguous support uses a hyphen range (`16 - 21`); genuinely non-contiguous support uses a caret union (`^6.0.0 || ^10.0.0`).
3. **The lower bound is the oldest major that can technically resolve**, determined by the transitive constraints our packages impose — chiefly the TypeScript peer — and confirmed by CI.
4. **The upper bound is the newest major CI validates**, which is at minimum the major the monorepo itself builds against. It may extend one major beyond that — the pattern `@angular/material` uses with `^22.0.0 || ^23.0.0` — but only once a CI leg validates that next major. Being `latest` on npm is not evidence.
5. **CI validates both bounds** for every framework with a declared range. A bound without a corresponding test is not permitted.
6. **Narrowing a range is a bug fix when it removes majors that could never resolve**, and a breaking change otherwise.
7. **The lower bound rises only at a major of the affected package.** At each major, it is raised to the oldest framework major still in upstream long-term support at that time. Between majors the range only widens.

TypeScript is an explicit exception to rules 2 and 4: it keeps an open lower bound with no ceiling.

### Rationale

A peer range is a machine-checked resolvability constraint, not a statement of where we choose to invest. Option B conflates the two, so a framework leaving upstream support would break installs that work — for Angular that would mean dropping majors 16 through 19 while they still resolve and build, buying nothing technically.

Between Options C and D, the deciding factor is that a range should assert only what has been measured. An open upper bound claims every future major works; when one does not, the consumer gets a broken build and no explanation, where a bounded range gives an unsupported-peer warning that names the problem. Because pnpm's `strict-peer-dependencies` defaults to false, that warning is advisory rather than an install failure, so the cost to consumers on a not-yet-validated major is mild.

The maintenance cost of an upper bound is what makes it affordable. ADR-0005 reduces each range to a single entry in `pnpm-workspace.yaml`, and Renovate already edits that file to bump framework catalogs, so raising a ceiling is one line in a pull request that was going to happen anyway.

Rule 6 distinguishes the two cases because they differ in observable effect. Removing `14 - 15` cannot break any consumer, since no coherent install existed. Removing a major that did resolve is a breaking change regardless of what the release is called, because consumers experience it as a hard resolution change.

Rule 7 exists so that narrowing is predictable and semver-honest. Tying retirement to the framework's own cadence was considered and rejected: Angular ships a major every six months, while `@coveo/atomic-angular` versions along the Atomic line, so retiring on Angular's schedule would mean shipping breaking changes in patch or minor releases. Deferring to our own majors keeps the release type honest, and batching the increase means one large, well-communicated jump instead of a series of small breaking ones.

This also keeps the two wrappers consistent. The same question was settled for React in KIT-5994 and pull request #8228, which considered narrowing to `^19` only and rejected it: neither React package used a React-19-only API, React 18 remained security-supported, and narrowing would have forced a migration on consumers for no functional gain. `@coveo/atomic-react` was widened to `^18 || ^19` instead. Angular 16 through 19 are in the same position today — they resolve and build — so they are retained until a major, at which point rule 7 applies.

Wide ranges are a legacy position rather than a goal. Across the Angular ecosystem, one or two supported majors is the norm: `ngx-markdown` and `@ng-bootstrap/ng-bootstrap` each pin a single major, and `@angular/material` supports the current major plus the next. Rule 4 borrows Material's pattern rather than inventing one.

TypeScript is carved out of the ceiling rule deliberately. It releases roughly quarterly, so a ceiling would generate near-continuous warnings, and its failure mode is a type error the consumer sees at compile time rather than a silent runtime break. The monorepo also always builds against the newest TypeScript.

## Consequences

- **Positive:** No published range can advertise a combination that cannot resolve. Ranges state only what CI verified. All framework peers become visible in one catalog, in one style.
- **Negative:** Each new framework major needs its ceiling raised, and until then its consumers see a peer warning. Rule 5 means adding a framework peer obliges adding CI coverage for it.
- **Negative:** Under rule 7 a range stays wider than the set of majors we would otherwise choose to support, for as long as the next major release is away. Angular 16 through 19 remain in the published range despite having left upstream long-term support.
- **Neutral:** Lower bounds will rise as the TypeScript floor in `@coveo/atomic` and `@coveo/headless` rises. Each rise is a separate decision, and breaking once it excludes a major that previously resolved.

## Operational Rules

### Keeping the range honest when the catalog moves

A unit test reads `pnpm-workspace.yaml`, takes the default catalog version of each framework and the corresponding `peer-compatibility` range, and asserts the former satisfies the latter. When Renovate bumps the Angular catalog to a major outside the declared ceiling, that pull request fails until someone widens the ceiling deliberately or decides not to adopt the major yet. The test runs offline in milliseconds on every pull request, and it also asserts that each bound has a corresponding CI leg, which makes rule 5 machine-checked.

Renovate is deliberately not configured to widen the range itself. Auto-widening would assert compatibility without evidence, which is what rules 2 and 4 exist to prevent. As a backstop at the integration level, one CI leg installs at the catalog version *without* `--legacy-peer-deps`, so the version we build against must fall inside the range we publish.

### Keeping CI coverage cheap

- One job builds and packs the library, and uploads the tarball as an artifact that every leg consumes. Legs never rebuild the monorepo.
- Each major has a committed minimal fixture application with a committed lockfile, installed with `npm ci --prefer-offline`. Scaffolding with `ng new` at run time is avoided: it is slow, network-dependent, and not reproducible.
- Each leg uses a component in a template rather than importing the module alone, so `strictTemplates` type-checks the generated inputs.
- Runtime coverage of the wrapper lives in version-agnostic unit tests over `utils.ts`, exercised with plain stubs and no Angular at all. These run once, outside the matrix. Running them per major is not viable, because Angular's own unit-test tooling differs across the supported range, so a cross-major harness would cost more than the build legs it replaced.

Consequently, majors between the bounds are build-verified only. Runtime verification happens on the version the monorepo builds against, through the existing Playwright suite. This limitation should be stated wherever the supported range is published, rather than implied.

## Implementation and Follow-up

Angular is the first application of this policy, under epic KIT-4735:

- Add `@angular/common` and `@angular/core` to `catalogs.peer-compatibility` and reference them from `@coveo/atomic-angular`, replacing the hardcoded `14 - 21`.
- The range becomes `16 - 21`. The ceiling is 21 because that is the major the monorepo builds against; Angular 22 is `latest` on npm but is neither built nor tested here, and rule 4 does not accept registry recency as evidence. The floor is provisional: it derives from the TypeScript overlap alone, and one constraint is untested — the package is `exports`-only with no root `main`, and `moduleResolution: bundler` did not become the Angular CLI default until v17, so the floor may be 17.
- Raising the ceiling to 22 belongs with the change that upgrades the Angular catalog to 22, so the range and the build move together.

Note that `@angular/core` and `@angular/common` also appear under `pnpm.overrides` in `pnpm-workspace.yaml`. Those entries pin the version used to build and test inside this workspace and have no effect on published manifests. They are not a substitute for, and must not be confused with, the `peer-compatibility` entries.

Remaining work, each its own change:

- At the next major of `@coveo/atomic-angular`, apply rule 7 and raise the floor to the oldest Angular major then in long-term support. On today's schedule that would be 20, since Angular 19 left support in May 2026. This is not yet scheduled: the v4 Feature (KIT-5934) is on hold.
- Audit `pino-pretty` against rule 2 and bring it into the catalog (KIT-6103). Its optional peers, and those of `@coveo/headless`, should also carry `peerDependenciesMeta.optional` so consumers are not warned about dependencies they do not use.
- Confirm the React range against rules 2 to 5 and add the CI coverage rule 5 requires, which does not exist for React today.

Node.js is deliberately out of scope. It is expressed through `engines` rather than `peerDependencies` and already tracks Node's own LTS lines.

This ADR should be revisited when a framework peer is added or removed, or when the TypeScript exception stops holding.
