# 0001 - Define explicit domain entrypoints for platform-mock-api

**Status:** Proposed

**Date:** 2026-07-29

**Related:** [PR #8075](https://github.com/coveo/ui-kit/pull/8075), [review discussion](https://github.com/coveo/ui-kit/pull/8075#discussion_r3667824476)

## Context

`@coveo/platform-mock-api` is a private package used throughout the ui-kit
workspace to mock Coveo Platform APIs. Its package manifest currently exposes
the root entrypoint and a wildcard subpath:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./*": "./dist/*.js"
  }
}
```

The wildcard makes the emitted directory structure part of the package
contract. Every source file copied to `dist` is importable, including
implementation-oriented files such as `_base`, `_request-transformer`, and
`_common/error`. Adding or moving a file can therefore add or break an API
without an explicit decision or a change to `package.json`.

This became visible in PR #8075. Atomic's Storybook resolver needs to consume
the package from TypeScript sources during local development. Because consumers
use arbitrary deep imports, the proposed resolver must accept any path beginning
with `@coveo/platform-mock-api/` and translate it to the corresponding source
file. That duplicates the package wildcard at the tooling layer and makes
otherwise internal files valid inputs there too.

At the time of this decision, the repository contains 292 import occurrences
across 19 distinct specifiers: the root and 18 file-level subpaths. Most imports
belong to three domains (`search`, `commerce`, and `insight`), but consumers also
reach directly into response fixtures, transformers, and response generators.
The package being private reduces release concerns, but it does not reduce the
maintenance cost of an accidental and unbounded contract.

### Decision drivers

- Make every supported import path intentional and reviewable.
- Let implementation files move without requiring repository-wide migrations.
- Keep related mock APIs, fixtures, transformers, and generators discoverable by
  Platform API domain.
- Preserve convenient imports for the most common mock classes.
- Ensure local source resolution and built-package resolution expose the same
  contract.
- Avoid a long list of file-level exports that must track the source tree.

## Decision

Replace the wildcard subpath export with a small, explicit set of domain
entrypoints:

- `@coveo/platform-mock-api`
- `@coveo/platform-mock-api/search`
- `@coveo/platform-mock-api/commerce`
- `@coveo/platform-mock-api/insight`
- `@coveo/platform-mock-api/recommendation`
- `@coveo/platform-mock-api/machinelearning`
- `@coveo/platform-mock-api/agent`
- `@coveo/platform-mock-api/answer`
- `@coveo/platform-mock-api/converse`

The root entrypoint remains a convenience API for the primary `Mock*Api`
classes and shared harness types. Each domain entrypoint is backed by an
`index.ts` that explicitly re-exports only the fixtures and helpers intended for
consumers. Source filenames and folders below those entrypoints are
implementation details and cannot be imported through the package.

Response families with generic names such as `baseResponse` and `richResponse`
are exposed as descriptive namespaces from their domain entrypoint. This avoids
name collisions without creating file-level package entrypoints. For example:

```ts
import {
  MockCommerceApi,
  commerceFacetTransformer,
  commercePaginationTransformer,
  listingResponses,
  recommendationResponses,
  searchResponses,
} from '@coveo/platform-mock-api/commerce';

const response = searchResponses.richResponse;
```

A representative domain barrel would be explicit:

```ts
export {MockCommerceApi} from './mock.js';
export {commerceFacetTransformer, createFacetSearchTransformer} from './facet-transformer.js';
export {commercePaginationTransformer} from './pagination-transformer.js';
export * as listingResponses from './listing-response.js';
export * as recommendationResponses from './recommendation-response.js';
export * as searchResponses from './search-response.js';
```

The package export map lists every supported entrypoint individually and does
not contain a wildcard:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "source": "./src/index.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./search": {
      "types": "./dist/search/index.d.ts",
      "source": "./src/search/index.ts",
      "import": "./dist/search/index.js",
      "default": "./dist/search/index.js"
    },
    "./commerce": {
      "types": "./dist/commerce/index.d.ts",
      "source": "./src/commerce/index.ts",
      "import": "./dist/commerce/index.js",
      "default": "./dist/commerce/index.js"
    }
  }
}
```

The omitted domains follow the same structure. The `source` condition is for
workspace tooling only; normal consumers continue to resolve declarations and
built JavaScript. Storybook source mode must resolve these exact manifest keys
and their `source` targets, rather than translating arbitrary package prefixes.
The manifest is therefore the allowlist for both built and source consumption.

Adding a supported symbol requires an explicit export from an existing domain
barrel. Adding a new domain entrypoint additionally requires an explicit
manifest entry. Merely adding a source file never expands the package contract.

## Options considered

### Option A: Keep the wildcard subpath export

- **Pros:** No consumer migration; any new fixture is immediately importable.
- **Cons:** Couples consumers and tooling to the source layout; exposes
  internals by default; makes the package surface grow without review.
- **Reason rejected:** Convenience for package authors does not justify an
  unbounded and accidental contract.

### Option B: Enumerate every current file-level subpath

- **Pros:** Prevents new files from becoming public automatically and minimizes
  changes to existing import statements.
- **Cons:** Preserves 18 narrow entrypoints, keeps filenames contractual, and
  requires manifest edits for routine file organization.
- **Reason rejected:** It closes the wildcard while retaining most of its
  brittleness.

### Option C: Expose only the root entrypoint

- **Pros:** One obvious import path and one package contract.
- **Cons:** Produces a large flat API; generic fixture names collide; unrelated
  domains become harder to discover and may be loaded together by tooling that
  does not tree-shake.
- **Reason rejected:** The package naturally contains distinct Platform API
  domains, and the root should not become another oversized barrel.

### Option D (selected): Root convenience API plus explicit domain entrypoints

- **Pros:** Small bounded import surface; domain-oriented discovery; no
  filename-level contracts; exact source resolution; manageable barrels.
- **Cons:** Requires a one-time migration and deliberate maintenance of domain
  barrels.
- **Risk:** A domain barrel can still become too broad. Reviewers must treat a
  new re-export as an API decision, even though the package is private.

## Consequences

### Positive

- Unsupported imports fail immediately through Node and TypeScript package
  resolution.
- Source files can be renamed, split, or moved behind a stable domain
  entrypoint.
- Code review can identify package-surface changes in a domain barrel or the
  manifest.
- Storybook no longer needs a permissive prefix resolver for this package.
- Consumers can find the capabilities for a Platform API in one documented
  module.

### Negative

- Existing deep imports must be migrated.
- Generic response exports require a namespace-qualified access such as
  `searchResponses.baseResponse`.
- Package maintainers must curate the domain barrels.
- Importing a domain barrel may evaluate more modules than importing one file.
  The package is test-only, and standard ESM tree-shaking limits this cost, so
  this trade-off is acceptable.

## Migration and rollout

This is an internal breaking change. Because all known consumers are in the
monorepo, implement it atomically in one pull request:

1. Add one curated `index.ts` for each domain and adjust the root barrel to
   expose only primary mock classes and shared harness types.
2. Replace `"./*"` in `package.json` with the explicit entrypoints and their
   `types`, `source`, `import`, and `default` targets.
3. Migrate imports according to their domain. For example:
   - `@coveo/platform-mock-api/search/mock` →
     `@coveo/platform-mock-api/search`
   - `@coveo/platform-mock-api/search/search-response` →
     `@coveo/platform-mock-api/search`
   - `@coveo/platform-mock-api/commerce/facet-transformer` →
     `@coveo/platform-mock-api/commerce`
   - `@coveo/platform-mock-api/agent/generate-response` →
     `@coveo/platform-mock-api/agent`
4. Update Atomic's Storybook development resolver to use only exact package
   export keys and their `source` targets. Do not add a package-prefix fallback.
5. Add a package-contract test that verifies every declared entrypoint resolves
   after a build and representative deep imports such as
   `@coveo/platform-mock-api/search/mock` and
   `@coveo/platform-mock-api/_base` do not resolve.
6. Verify that no file-level platform-mock-api imports remain, then run the
   package build and affected Atomic Storybook tests.

Rollback consists of reverting the migration and restoring the wildcard export.
No runtime data or external package consumers are involved.
