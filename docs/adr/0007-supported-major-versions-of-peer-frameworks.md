---
status: Proposed
date: 2026-08-24
related:
  - https://coveord.atlassian.net/browse/KIT-4735
  - https://coveord.atlassian.net/browse/KIT-5980
  - docs/adr/0003-catalog-first-dependency-management-with-automated-reporting.md
  - docs/adr/0005-peer-dependency-compatibility-catalog.md
  - packages/headless/source_docs/product-lifecycle.md
---

# Bound and document the supported major versions of peer frameworks

## Context and Problem Statement

This monorepo publishes wrappers around third-party frameworks (`@coveo/atomic-angular`, `@coveo/atomic-react`, `@coveo/headless-react`) plus core packages that declare a TypeScript peer. Each of these advertises which major versions of a framework it works with, and today each does so differently:

| Peer | Declared range | Style | In catalog |
| --- | --- | --- | --- |
| `@angular/common`, `@angular/core` | `14 - 21` | Hyphen range | No |
| `react`, `react-dom`, `@types/react`, `@types/react-dom` | `^18 \|\| ^19` | Caret union | Yes |
| `typescript` | `>=5.0.0` | Open lower bound | Yes |
| `pino-pretty` | `^6.0.0 \|\| ^10.0.0 \|\| ^11.0.0 \|\| ^13.0.0` | Sparse caret union | No |

Three problems follow from having no rule.

**Ranges drift in both directions without anyone noticing.** The Angular range claims support for versions 14 and 15, which cannot resolve: `@coveo/atomic` and `@coveo/headless` declare a `typescript: '>=5.0.0'` peer, while Angular's `@angular/compiler-cli` caps TypeScript at `<4.9` for v14 and `<5.0` for v15. The same range excludes Angular 22, which is currently `latest` on npm. Both errors survived because nothing tests the bounds — CI builds one Angular version, the single value pinned in the default catalog.

**There is no statement of what we support.** `packages/headless/source_docs/product-lifecycle.md` is the closest thing, but it is scoped to Headless, mentions no framework version, and is already stale on its own TypeScript entry (it says v4.9+ where the catalog says `>=5.0.0`). A consumer cannot find out which Angular or React majors Coveo commits to.

**Upstream support policies are not uniform.** Angular publishes a dated schedule (six months active, twelve months LTS), so "the versions upstream still supports" is a well-defined set. React publishes no support schedule or end-of-life dates at all. A policy phrased purely as an intersection with upstream support is unimplementable for React.

## Decision Drivers

- Never advertise a peer range that cannot produce a working install.
- Never break an install that works today without a major version.
- Assert compatibility only with majors that CI has actually exercised.
- Give consumers an install-time signal when they move outside the validated range.
- State the support commitment somewhere a consumer can find it.
- Work for frameworks with and without a published upstream support schedule.
- Follow the catalog-first policy so ranges do not bypass the catalog.

## Considered Options

### Option A: Status quo — per-package, ad hoc ranges

- **Summary:** Leave each package to declare its own range in its own style.
- **Pros:** No work.
- **Cons:** Reproduces the drift that motivated this ADR. Nothing keeps a range honest, and nothing tells a consumer what is supported.

### Option B: One number — the peer range *is* the support commitment

- **Summary:** Narrow each peer range to exactly the majors we commit to supporting.
- **Pros:** The two cannot diverge. Smallest advertised surface.
- **Cons:** Hard-fails installs on majors that work but are outside the commitment, making every narrowing a breaking change. Conflates "we will not fix bugs here" with "this cannot work".

### Option C: Two numbers — bounded technical range, documented commitment

- **Summary:** The peer range states technical compatibility, bounded below and above by what CI validates. The support commitment is documented separately.
- **Pros:** Narrowing to the technical floor drops only majors that could never resolve, so it ships as a bug fix. The range asserts only what was measured. Consumers outside the validated range get a peer warning that names the problem.
- **Cons:** Two artifacts to keep in sync. A consumer inside the range but outside the commitment installs cleanly and must read the docs to learn they are unsupported.

### Option D: Two numbers with an open upper bound

- **Summary:** As Option C, but with no ceiling (`>=16`).
- **Pros:** No edit when a framework ships a major.
- **Cons:** Asserts compatibility with majors that do not exist yet and cannot have been tested. A consumer on a future incompatible major gets a broken build with no signal. Leaves the widest gap between the published range and the documented commitment.

## Decision Outcome

Option C. Concretely:

1. **Every shared peer range lives in `catalogs.peer-compatibility`** (ADR-0005) and is referenced as `catalog:peer-compatibility`. This extends that catalog beyond TypeScript and React to Angular and any future framework peer.
2. **Every framework peer range has an explicit lower and upper bound.** Contiguous support uses a hyphen range (`16 - 21`); genuinely non-contiguous support uses a caret union (`^6.0.0 || ^10.0.0`).
3. **The lower bound is the oldest major that can technically resolve**, determined by the transitive constraints our packages impose — chiefly the TypeScript peer — and confirmed by CI.
4. **The upper bound is the newest major CI validates**, which is at minimum the major the monorepo itself builds against. It may extend one major beyond that — the pattern `@angular/material` uses with `^22.0.0 || ^23.0.0` — but only once a CI leg validates that next major. `latest` on npm is not a criterion; having a passing CI leg is.
5. **CI must validate both bounds** for every framework with a declared peer range. A range without a corresponding test is not permitted.
6. **The support commitment is documented in one monorepo-level location**, covering every published package rather than Headless alone, and every published package's README links to it. Where upstream publishes a support schedule, the commitment is the intersection of that schedule with our peer range. Where upstream publishes none, the commitment is the two most recent majors.
7. **Narrowing a range is a bug fix when it removes majors that could never resolve**, and a breaking change when it removes majors that previously resolved.

TypeScript is an explicit exception to rules 2 and 4: it keeps an open lower bound with no ceiling.

### Rationale

`peerDependencies` and a support commitment answer different questions. A peer range is a machine-checked resolvability constraint; a commitment is a statement about where we invest. Option B forces one value to answer both, so every reduction in commitment breaks working installs — for Angular that would mean dropping majors 16 through 19 and waiting for a major release, buying nothing technically.

Between Options C and D, the deciding factor is that a range should assert only what has been measured. An open upper bound claims every future major works. When one does not, the consumer gets a broken build and no explanation, where a bounded range gives an unsupported-peer warning that names the problem. Because pnpm's `strict-peer-dependencies` defaults to false, that warning is advisory rather than an install failure, so the cost to consumers on a not-yet-validated major is mild.

The maintenance cost of an upper bound is what makes it affordable. ADR-0005 reduces each range to a single entry in `pnpm-workspace.yaml`, and Renovate already edits that file to bump framework catalogs. Raising a ceiling is one line in a pull request that was going to happen anyway, gated by the CI leg for that major.

Rule 6 splits by whether upstream publishes a schedule because Angular and React genuinely differ. Angular's dated six-plus-twelve-month window makes an intersection meaningful. React publishes no end-of-life dates, so "two most recent majors" supplies the bound that upstream does not, and matches the `^18 || ^19` range already in use.

TypeScript is carved out of the ceiling rule deliberately. It releases roughly quarterly, so a ceiling would generate near-continuous warnings, and its failure mode is a type error the consumer sees immediately at compile time rather than a silent runtime break. The monorepo also always builds against the newest TypeScript, so the newest version is continuously exercised.

Option A is rejected because it is the state that produced two wrong bounds on one range and no discoverable commitment.

## Consequences

- **Positive:** No published range can advertise a combination that cannot resolve. Ranges state only what CI verified. All framework peers become visible in one catalog and one policy document. Support commitments shrink without breaking working installs.
- **Negative:** Ranges and documentation must be kept in sync by review discipline rather than tooling. Each new framework major needs its ceiling raised, and until then its consumers see a peer warning. Rule 5 means adding a framework peer now obliges adding a CI matrix for it.
- **Neutral:** Lower bounds will rise as the TypeScript floor in `@coveo/atomic` and `@coveo/headless` rises. Each rise is a separate decision, and breaking once it excludes a major that previously resolved.

## Operational Rules

These four mechanisms make the policy enforceable rather than aspirational.

### Keeping the range honest when the catalog moves

A unit test reads `pnpm-workspace.yaml`, takes the default catalog version of each framework and the corresponding `peer-compatibility` range, and asserts the former satisfies the latter. When Renovate bumps the Angular catalog to a major outside the declared ceiling, that pull request fails until someone widens the ceiling deliberately or decides not to adopt the major yet. The test runs offline in milliseconds on every pull request, and it also asserts that each bound has a corresponding CI leg, which makes rule 5 machine-checked.

Renovate is deliberately not configured to widen the range itself. Auto-widening would assert compatibility without evidence, which is what rules 2 and 4 exist to prevent. As a backstop at the integration level, one matrix leg installs at the catalog version *without* `--legacy-peer-deps`, so the version we build against must fall inside the range we publish.

### Keeping the matrix cheap

- One job builds and packs the library, and uploads the tarball as an artifact that every leg consumes. Legs never rebuild the monorepo.
- Each major has a committed minimal fixture application with a committed lockfile, installed with `npm ci --prefer-offline`. Scaffolding with `ng new` at run time is avoided: it is slow, network-dependent, and not reproducible.
- Each leg uses a component in a template rather than importing the module alone, so `strictTemplates` type-checks the generated inputs.
- Runtime coverage of the wrapper lives in version-agnostic unit tests over `utils.ts`, exercised with plain stubs and no Angular at all. These run once, outside the matrix. Running them per major is not viable, because Angular's own unit-test tooling differs across the supported range, so a cross-major harness would cost more than the build legs it replaced.

Consequently, majors between the bounds are build-verified only. Runtime verification happens on the primary version through the existing Playwright suite. This is stated in the support document rather than implied.

### Removing a major

The two numbers carry different semver weight, which is what makes narrowing tractable for packages whose major tracks a product line rather than a framework:

- Removing a major from the **documented commitment** is not a semver event. It ships in any release.
- Removing a major from the **peer range** is breaking, and waits for the next major of the affected package. `@coveo/atomic-angular` tracks the Atomic major line, so no independent major is cut for this purpose.
- Removing a major that could never resolve is a **patch**, per rule 7.

A deprecation window expressed as a minor is rejected: consumers experience a narrowed range as a hard resolution change regardless of the release type. The accepted consequence is that a peer range stays wider than its commitment for a long time, which is the intended behaviour of separating them.

### Detecting the end of upstream support

A monthly scheduled job reads published end-of-life data — `https://endoflife.date/api/angular.json` for Angular — and opens an issue when the documented commitment still contains a major that is out of support.

End-of-life dates must be read from published data, never derived. A "release plus eighteen months" heuristic matches Angular 19 and 20 exactly but diverges by roughly six weeks for Angular 21 and seven months for Angular 22, whose published end-of-life is later than the heuristic predicts. The heuristic is retained only as a cross-check: disagreement means the upstream schedule changed and warrants review.

This signal targets the commitment rather than the peer range, because narrowing the range waits for a major.

## Implementation and Follow-up

Angular is the first application of this policy, under epic KIT-4735:

- Add `@angular/common` and `@angular/core` to `catalogs.peer-compatibility` and reference them from `@coveo/atomic-angular`, replacing the hardcoded `14 - 21`.
- The intended range is `16 - 21`. The ceiling is 21 because that is the major the monorepo builds against; Angular 22 is `latest` on npm but is not built or tested here, and rule 4 does not accept `latest` as evidence. The floor is provisional: it derives from the TypeScript overlap alone, and one constraint is untested — the package is `exports`-only with no root `main`, and `moduleResolution: bundler` did not become the Angular CLI default until v17, so the floor may be 17.
- Raising the ceiling to 22 belongs with the change that upgrades the Angular catalog to 22, so the range and the build move together.
- Under rule 6 the Angular commitment is majors 20 and 21. Angular 19 is out of support, and Angular 22, while still supported upstream, sits outside our peer range and therefore outside the intersection.

Note that `@angular/core` and `@angular/common` also appear under `pnpm.overrides` in `pnpm-workspace.yaml`. Those entries pin the version used to build and test inside this workspace and have no effect on published manifests. They are not a substitute for, and must not be confused with, the `peer-compatibility` entries.

Remaining work, each its own change:

- Establish the monorepo-level support document required by rule 6. `product-lifecycle.md` is Headless-scoped and cannot serve as-is; its stale TypeScript entry should be corrected in the same change.
- Add the README links required by rule 6. `@coveo/atomic-angular` publishes Angular CLI 13 scaffolding boilerplate as its README, so that package needs a real README before a link is meaningful.
- Audit `pino-pretty` against rule 2 and bring it into the catalog. Its optional peers, and those of `@coveo/headless`, should also carry `peerDependenciesMeta.optional` so consumers are not warned about dependencies they do not use.
- Confirm the React range against rule 6 and add the CI coverage rule 5 requires, which does not exist for React today.

Node.js is deliberately out of scope. It is expressed through `engines` rather than `peerDependencies` and already tracks Node's own LTS lines.

Wide ranges are a legacy position, not a goal. Across the Angular ecosystem, one or two supported majors is the norm — `ngx-markdown` and `@ng-bootstrap/ng-bootstrap` each pin a single major, and `@angular/material` supports the current major plus the next. The `16 - 21` range exists because a broader promise was already published, and the intent is to converge toward two majors at the next major of `@coveo/atomic-angular`.

This ADR should be revisited when a framework peer is added or removed, or when the TypeScript exception stops holding.
