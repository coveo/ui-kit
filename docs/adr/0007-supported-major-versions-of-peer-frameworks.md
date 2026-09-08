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

| Peer                                                     | Declared range                                  | Style              | In catalog |
| -------------------------------------------------------- | ----------------------------------------------- | ------------------ | ---------- |
| `@angular/common`, `@angular/core`                       | `14 - 21`                                       | Hyphen range       | No         |
| `react`, `react-dom`, `@types/react`, `@types/react-dom` | `^18 \|\| ^19`                                  | Caret union        | Yes        |
| `typescript`                                             | `>=5.0.0`                                       | Open lower bound   | Yes        |
| `pino-pretty`                                            | `^6.0.0 \|\| ^10.0.0 \|\| ^11.0.0 \|\| ^13.0.0` | Sparse caret union | No         |

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
- **Cons:** Narrowing a range is breaking for consumers, and upstream cadences do not match ours. Angular ships a major every six months while `@coveo/atomic-angular` versions along the Atomic line, so this would mean shipping breaking changes in patch or minor releases. It also conflates "upstream stopped maintaining this" with "this cannot work": Angular 18 and 19 resolve and build today.

### Option C: A range bounded by what CI validates

- **Summary:** The range states technical compatibility, bounded below and above by what CI exercises, and moves only at a major of the affected package.
- **Pros:** Narrowing to the technical floor drops only majors that could never resolve, so it ships as a bug fix. The range asserts only what was measured. Consumers outside it get a peer warning naming the problem.
- **Cons:** The range stays wider than the set of majors we would choose to support, for as long as a major release is away.

### Option D: A range with an open upper bound

- **Summary:** As Option C, but with no ceiling (`>=18`).
- **Pros:** No edit when a framework ships a major.
- **Cons:** Asserts compatibility with majors that do not exist yet. A consumer on a future incompatible major gets a broken build rather than a warning.

## Decision Outcome

Option C. Concretely:

1. **Every peer range declared by more than one package lives in `catalogs.peer-compatibility`** (ADR-0005) and is referenced as `catalog:peer-compatibility`. This extends that catalog beyond TypeScript and React to Angular and any future framework peer. A peer declared by exactly one package stays in that package's manifest: the catalog exists to stop participating packages from drifting apart, and with a single declarer there is nothing to drift.
2. **Every framework peer range is expressed as a caret union with one clause per supported major**, using the bare major form: `^16 || ^17 || ^18`. This applies whether the supported majors are contiguous or not. Hyphen ranges are not used.
3. **The lower bound is the oldest major that can technically resolve**, determined by the transitive constraints our packages impose — chiefly the TypeScript peer — and confirmed by CI.
4. **The upper bound is the newest major CI validates**, which is at minimum the major the monorepo itself builds against. It may extend one major beyond that — the pattern `@angular/material` uses with `^22.0.0 || ^23.0.0` — but only once a CI leg validates that next major. Being `latest` on npm is not evidence.
5. **CI validates the floor** of every framework range, by building a consumer application pinned to that major against the packed wrapper. The ceiling needs no dedicated check: it is the version the monorepo builds against, so the in-repo samples already exercise it.
6. **Narrowing a range is a bug fix when it removes majors that could never resolve**, and a breaking change otherwise.
7. **The lower bound rises only at a major of the affected package.** At each major, it is raised to the oldest framework major still in upstream long-term support at that time. Between majors the range only widens. Determining which majors are still supported is part of planning that major release; it is not tracked continuously.

TypeScript is an explicit exception to rules 2 and 4: it keeps an open lower bound with no ceiling.

Rules 2 through 5 apply to framework peers — the packages a consumer builds their application with, where a major version is a migration. They do not apply to incidental peers such as an optional log formatter, which should instead be marked optional so consumers are not warned about dependencies they never install.

### Rationale

A peer range is a machine-checked resolvability constraint, not a statement of where we choose to invest. Option B conflates the two, so a framework leaving upstream support would break installs that work — for Angular that would mean dropping majors 18 and 19 while they still resolve and build, buying nothing technically.

Between Options C and D, the deciding factor is that a range should assert only what has been measured. An open upper bound claims every future major works; when one does not, the consumer gets a broken build and no explanation, where a bounded range gives an unsupported-peer warning that names the problem. Because pnpm's `strict-peer-dependencies` defaults to false, that warning is advisory rather than an install failure, so the cost to consumers on a not-yet-validated major is mild.

The maintenance cost of an upper bound is what makes it affordable. ADR-0005 reduces each range to a single entry in `pnpm-workspace.yaml`, and Renovate already edits that file to bump framework catalogs, so raising a ceiling is one line in a pull request that was going to happen anyway.

Rule 2 chooses the caret union over a hyphen range for three reasons. A hyphen range is easy to misread: `16 - 21` resolves to `>=16.0.0 <22.0.0-0`, so it accepts `21.99.99`, but it is commonly read as stopping at `21.0.0`. A union enumerates the supported majors explicitly, so adding or removing one is a single clause in the diff. And because a genuinely non-contiguous range such as `pino-pretty` requires a union anyway, using it everywhere means one form rather than two, and no per-case judgement about whether a span counts as contiguous. `^16` and `^16.0.0` are semver-identical; the bare major form is used for brevity.

This also matches what the repository and the ecosystem already do. `@coveo/atomic-react` publishes `^18 || ^19`, and `@angular/material` publishes `^22.0.0 || ^23.0.0`. No surveyed Angular library uses a hyphen range.

Rule 6 distinguishes the two cases because they differ in observable effect. Removing `14 - 15` cannot break any consumer, since no coherent install existed. Removing a major that did resolve is a breaking change regardless of what the release is called, because consumers experience it as a hard resolution change.

Rule 7 exists so that narrowing is predictable and semver-honest. Tying retirement to the framework's own cadence was considered and rejected: Angular ships a major every six months, while `@coveo/atomic-angular` versions along the Atomic line, so retiring on Angular's schedule would mean shipping breaking changes in patch or minor releases. Deferring to our own majors keeps the release type honest, and batching the increase means one large, well-communicated jump instead of a series of small breaking ones.

This also keeps the two wrappers consistent. The same question was settled for React in KIT-5994 and pull request #8228, which considered narrowing to `^19` only and rejected it: neither React package used a React-19-only API, React 18 remained security-supported, and narrowing would have forced a migration on consumers for no functional gain. `@coveo/atomic-react` was widened to `^18 || ^19` instead. Angular 18 and 19 are in the same position today — they resolve and build — so they are retained until a major, at which point rule 7 applies.

Wide ranges are a legacy position rather than a goal. Across the Angular ecosystem, one or two supported majors is the norm: `ngx-markdown` and `@ng-bootstrap/ng-bootstrap` each pin a single major, and `@angular/material` supports the current major plus the next. Rule 4 borrows Material's pattern rather than inventing one.

TypeScript is carved out of the ceiling rule deliberately. It releases roughly quarterly, so a ceiling would generate near-continuous warnings, and its failure mode is a type error the consumer sees at compile time rather than a silent runtime break. The monorepo also always builds against the newest TypeScript.

## Consequences

- **Positive:** No published range can advertise a combination that cannot resolve. Ranges state only what CI verified. All framework peers become visible in one catalog, in one style.
- **Negative:** Each new framework major needs its ceiling raised, and until then its consumers see a peer warning. Rule 5 means adding a framework peer obliges adding CI coverage for it.
- **Negative:** A caret union is verbose for a wide span: `^18 || ^19 || ^20 || ^21` against `18 - 21`. Rule 7 narrows the span at each major, so the verbosity is self-limiting.
- **Negative:** Under rule 7 a range stays wider than the set of majors we would otherwise choose to support, for as long as the next major release is away. Angular 18 and 19 remain in the published range despite having left upstream long-term support.
- **Neutral:** Lower bounds will rise as the TypeScript floor in `@coveo/atomic` and `@coveo/headless` rises. Each rise is a separate decision, and breaking once it excludes a major that previously resolved.

## Enforcement

Enforcement rests on building a real consumer application against the packed wrapper at each range floor.

### What the floor check does

Each leg scaffolds a consumer application pinned to one framework major, installs the packed wrapper and the peers it declares, references a generated component's type from real source, and builds. That exercises package resolution, the TypeScript range that major pins, and the generated type surface together — which is what makes it evidence about the range rather than about the package alone.

Peers are installed explicitly from the packed manifest rather than left to the package manager, so a missing peer cannot fail a leg for the wrong reason.

The leg body lives in `scripts/verify-framework-compat.mjs`, invoked identically in CI and locally, so a maintainer can reproduce a failure without pushing. There is one job per wrapper, each gated on its own package in the affected task set, so touching one wrapper does not run another's legs.

**Only floors are covered.** Angular runs 18, React runs 18. Ceilings are excluded because the ceiling is the version the monorepo builds against and the in-repo samples already build against it. Intermediate majors are not covered either, so a leg exists per wrapper rather than per supported major.

### What is not enforced mechanically

**Rule 4 has no automated check.** Nothing verifies that the version the monorepo builds against still falls inside the published ceiling. The in-repo samples resolve the wrapper through `workspace:*`, which links the source directory and never resolves the published `peerDependencies`, so they prove the ceiling _builds_ without proving it is _declared_. Raising the ceiling when the framework catalog is bumped is therefore a review-time obligation.

A leg installing at the catalog version with strict peers was considered and rejected: it duplicates a build the samples already perform, purely to assert a range. That was judged more machinery than the failure warrants, because publishing a ceiling one major behind produces a peer warning for early adopters of that major rather than a broken build, and pnpm's `strict-peer-dependencies` defaults to false.

Rule 2's format is also not machine-checked. It is a review-time convention, enforced the way the rest of the repository's manifest conventions are. A malformed range is visible in a one-line diff.

### Keeping the floor checks cheap

- One leg per wrapper, so the number of legs grows with the number of wrappers rather than with the width of any range.
- The Angular application is scaffolded with the CLI for the major under test. A committed fixture per major was considered and rejected: `angular.json` builders and the generated `tsconfig.json` both differ across majors — `@angular-devkit/build-angular:browser` gave way to `@angular/build:application`, and `moduleResolution` changed twice — so a hand-maintained configuration per major is both more fragile and less faithful than letting the matching CLI generate one. Generating it is also what made the floor measurable: the resolution default under test is the CLI's, not ours. React needs no scaffolding tool, so its application is written directly.
- Each leg references a generated component's type rather than importing the module alone, so a change to the generated surface fails the build.

## Implementation and Follow-up

Angular is the first application of this policy, under epic KIT-4735:

- Add `@angular/common` and `@angular/core` to `catalogs.peer-compatibility` and reference them from `@coveo/atomic-angular`, replacing the hardcoded `14 - 21`.
- The range becomes `^18 || ^19 || ^20 || ^21`. The ceiling is 21 because that is the major the monorepo builds against; Angular 22 is `latest` on npm but is neither built nor tested here, and rule 4 does not accept registry recency as evidence.
- The floor is 18, measured rather than assumed. The constraint is not TypeScript but module resolution. Angular 16 and 17 both emit `moduleResolution: node` from their own CLI, which predates the `exports` field. The wrapper's types reach `@coveo/atomic/components` and `@coveo/headless/commerce`, and both are reachable only through `exports` subpaths with no root-level declaration file, so neither resolves under classic resolution. Taken from the `tsconfig.json` template each major's `@schematics/angular` generates:

| Angular major | Generated setting                      | Resolves `exports` subpaths |
| ------------- | -------------------------------------- | --------------------------- |
| 16, 17        | `moduleResolution: node`               | No                          |
| 18, 19        | `moduleResolution: bundler`            | Yes                         |
| 20, 21        | `module: preserve`, implying `bundler` | Yes                         |

- The two failures below the floor differ in how visible they are, which is the reason the floor leg builds an application instead of inspecting the package. On Angular 16 the build fails outright with `TS2307`. On Angular 17 those same errors sit inside a declaration file and are suppressed by the `skipLibCheck: true` the CLI generates, so the build reports nothing while the wrapper's type surface silently collapses to its protected members. A consumer binding `[field]` on `atomic-facet` then gets `NG8002` against a component the compiler believes has no inputs. No check that reads the published package alone would surface either case, because the package is identical in both.
- Removing 16 and 17 is a bug fix under rule 6 rather than a breaking change, on the narrow ground that neither ever worked with the framework's own defaults. The qualification matters: setting `moduleResolution: bundler` by hand does make both work, so a consumer who had already done that was relying on a configuration this package never documented or tested. Had the floor leg passed at 16, dropping it would have been breaking and would have waited for a major under rule 7.
- Raising the floor treats a symptom. The underlying defect is that `@coveo/atomic` and `@coveo/headless` expose subpaths only through `exports`, which degrades types for any TypeScript consumer on classic resolution, not only Angular ones. Adding `typesVersions` or root declaration files would restore 16 and 17 and fix non-Angular consumers at the same time; that is tracked separately, since it changes two packages beyond this one.
- Raising the ceiling to 22 belongs with the change that upgrades the Angular catalog to 22, so the range and the build move together.

Note that `@angular/core` and `@angular/common` also appear under `pnpm.overrides` in `pnpm-workspace.yaml`. Those entries pin the version used to build and test inside this workspace and have no effect on published manifests. They are not a substitute for, and must not be confused with, the `peer-compatibility` entries.

Remaining work, each its own change:

- At the next major of `@coveo/atomic-angular`, apply rule 7 and raise the floor to the oldest Angular major then in long-term support. On today's schedule that would be 20, since Angular 19 left support in May 2026. This is not yet scheduled: the v4 Feature (KIT-5934) is on hold.
- Determine the real supported `pino-pretty` range (KIT-6103). The declared `^6.0.0 || ^10.0.0 || ^11.0.0 || ^13.0.0` skips majors 7 through 9 and 12, which looks accreted rather than deliberate. Under rule 1 it stays in the `@coveo/headless` manifest, since no other package declares it.
- Confirm the React range against rules 2 to 4. Rule 5 does not apply to React, which imposes no TypeScript requirement of its own.

Node.js is deliberately out of scope. It is expressed through `engines` rather than `peerDependencies` and already tracks Node's own LTS lines.

This ADR should be revisited when a framework peer is added or removed, or when the TypeScript exception stops holding.
