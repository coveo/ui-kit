# Contributing to UI-Kit Samples

This guide outlines the conventions and requirements for creating and maintaining samples in the ui-kit repository.

## Dual Purpose: Samples & Scaffolding Starters

Every sample in this directory serves two roles:

1. **Living documentation**: Demonstrates correct usage of Coveo libraries.
2. **Scaffolding template**: Used by `npm create @coveo/ui` to bootstrap new projects.

This means every sample must be **self-contained, zero-config, and runnable out of the box** without any Coveo platform credentials or OAuth setup.

## Sample Standards

These are the definitive standards for how every sample is set up and maintained. Because samples are dual-purpose (living documentation **and** scaffolding templates) and are relied on as minimal reproducible examples (MREs) for troubleshooting, every sample must meet all of them. Where a standard has a dedicated section below, it is linked rather than repeated.

### Setup & structure

1. **Zero-config & self-contained.** Runs immediately after `pnpm install` with no monorepo runtime dependencies and no user-provided credentials, only the public `searchuisamples` sample organization. See [Sample Requirements](#sample-requirements).
2. **Single purpose.** Each sample focuses on one library + framework combination. See [Sample Requirements](#sample-requirements).
3. **Correctly named & scoped.** The package is named `@coveo/ui-kit-sample-<category>-<use-case>[-<framework>][-<variant>]`, matching its `--template` name. See [Naming Convention](#naming-convention).
4. **Standard script contract.** Exposes the expected `dev` / `build` / `test` / `e2e` scripts so CI discovers it with no extra wiring. See [Standard Script Contract](#standard-script-contract).
5. **Dependency hygiene.** Use `catalog:` for shared dependencies (both runtime and dev), `workspace:*` for internal `@coveo/*` packages, and pinned versions otherwise, so samples stay consistent and publishable.

### Quality & stability

6. **Buildable and stable.** Every sample must build, start, and render the expected experience. The Playwright smoke test is the contract: a failing sample is treated as a broken build, not a nice-to-have.
7. **Deterministic tests.** At least one Playwright smoke test verifies the sample loads and renders, using `@coveo/platform-mock-api` + MSW, never a live API. See [How Samples Are Tested in CI](#how-samples-are-tested-in-ci).
8. **Simple and debuggable.** Prefer plain, readable code over heavy abstractions or code generation. A non-developer should be able to open the generated project and understand what was created. Keep indirection to a minimum.
9. **Accessible.** Use semantic HTML and labeled, keyboard-operable controls so the rendered experience is usable and mirrors accessible real-world usage.
10. **Version-alignable.** Make it easy to reproduce against a specific UI Kit version. Document in the README how to pin, upgrade, or downgrade the relevant `@coveo/*` dependency after scaffolding (for example, `pnpm add @coveo/headless@<version>`).

### Documentation & distribution

11. **MRE-first documentation.** Each README includes a "Using this sample as an MRE" section that explains where to plug in a custom configuration (organization ID, access token, search hub, pipeline), which files are safe to modify when reproducing an issue, and which are scaffolding you can ignore.
12. **Customer-safe.** No Coveo-internal assumptions. Any hardcoded credentials must be the public `searchuisamples` sample credentials and clearly commented/documented as **public sample credentials**, never internal tokens.
13. **Published to npm as the scaffolding source.** Samples are configured to publish (public, with `publishConfig` and a `files` allowlist) and are released together through the changesets pipeline; pnpm resolves `workspace:*` / `catalog:` to concrete versions at publish, and `npm create @coveo/ui` fetches the published package. See [Relationship to Scaffolding](#relationship-to-scaffolding) and [ADR 002](../packages/create-ui/docs/adr/002-sample-publishing.md).

## Sample Requirements

Every sample **must** have:

| Requirement                          | Details                                                                                                                                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-configured credentials**       | Use the `searchuisamples` demo organization with the embedded public sample access token. No OAuth flow, no `.env` file, no user-provided credentials.                                                |
| **`pnpm install && pnpm dev` works** | A developer should be able to clone and run the sample with no additional setup. New samples must use a `dev` script.                                                                                 |
| **README.md**                        | Purpose, prerequisites, how to run, key features demonstrated.                                                                                                                                        |
| **Playwright smoke tests with MSW**  | At least one test verifying the sample loads and renders expected content, using `@coveo/platform-mock-api` for deterministic responses.                                                              |
| **Minimal configuration**            | Keep styling minimal and unbranded (a clean, functional look comparable to a default Atomic experience); no heavy themes or complex initialization. Use vanilla fields that work with the sample org. |
| **Single purpose**                   | Each sample focuses on one library + framework combination.                                                                                                                                           |

## Directory Structure

```
samples/
├── atomic/           # @coveo/atomic and @coveo/atomic-react samples
├── headless/         # @coveo/headless client-side rendering samples
└── headless-ssr/     # @coveo/headless server-side rendering samples
```

## Naming Convention

**Folder pattern:**

```
<category>/<use-case>[-<framework>][-<variant>]
```

**Examples:**

- `headless/search-vite`: Vanilla headless search (JS + Vite)
- `headless/commerce-react`: Headless commerce with React
- `headless-ssr/commerce-nextjs`: Headless SSR commerce with Next.js
- `atomic/search-commerce-angular`: Combined search + commerce in Angular

**Package name in `package.json`:**

```
@coveo/ui-kit-sample-<category>-<use-case>[-<framework>][-<variant>]
```

Samples carry the `@coveo/ui-kit-sample-*` name from the start (matching the `--template` name used by `npm create @coveo/ui`). For example, `samples/headless/search-react` is named `@coveo/ui-kit-sample-headless-search-react`. They are configured to be published as part of the release (public, with `publishConfig.access: "public"` and a `files` allowlist). See [ADR 002](../packages/create-ui/docs/adr/002-sample-publishing.md).

### Guidelines

- Use **kebab-case** for all names
- **Use cases**: `search`, `commerce`, `search-commerce` (combined)
- **Framework names**: `react`, `angular`, `nextjs`, `vuejs`
- **Variant suffixes**: `-app-router`, etc. for alternative implementations
- Vanilla (no-framework) samples use `-vite` as the framework suffix (e.g., `search-vite`)

## Creating a New Sample

### 1. Choose the correct category

- **`atomic/`**: Uses `@coveo/atomic` or `@coveo/atomic-react` components
- **`headless/`**: Uses `@coveo/headless` controllers with client-side rendering
- **`headless-ssr/`**: Uses `@coveo/headless-react` or similar with server-side rendering

### 2. Use sample credentials

All samples connect to the `searchuisamples` organization using the public sample access token. No authentication flow, no environment variables to configure.

```typescript
// Headless Search - uses embedded sample token
import {getSampleSearchEngineConfiguration} from '@coveo/headless';

// Headless Commerce - uses explicit public sample token
import {buildCommerceEngine} from '@coveo/headless/commerce';
// accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457', organizationId: 'searchuisamples'
```

For **search** samples, set the search hub to `BarcaKnowledge` (for example, `search.searchHub = 'BarcaKnowledge'` in Headless, or the `search-hub` attribute in Atomic). It returns richer, more relevant results than the default hub.

### 3. Write a README.md

Include:

- **Purpose**: One-liner on what the sample demonstrates
- **Template name**: The scaffolding template identifier
- **Prerequisites**: Node version, pnpm
- **Running**: `pnpm install && pnpm dev`
- **Key features**: What components/controllers are showcased
- **Using this sample as an MRE**: Where to set a custom configuration (organization ID, access token, search hub, pipeline), which files are safe to modify when reproducing an issue, and a note that the embedded credentials are **public** `searchuisamples` sample credentials (safe to share) (see [Sample Standards](#sample-standards))
- **Reproducing against a specific version**: How to pin/upgrade/downgrade the relevant `@coveo/*` dependency after scaffolding

### 4. Add Playwright smoke tests with `@coveo/platform-mock-api`

Every sample must include Playwright tests that use the internal `@coveo/platform-mock-api` package (at `packages/platform-mock-api`) and `@msw/playwright` for network mocking. This ensures tests are:

- **Deterministic**: No flakiness from live API calls
- **Fast**: No network latency
- **CI-friendly**: No dependency on external services

```typescript
// e2e/fixtures.ts
import {test as base, expect} from '@playwright/test';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {MockSearchApi} from '@coveo/platform-mock-api';

interface Fixtures {
  network: NetworkFixture;
}

export const searchApi = new MockSearchApi();

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...searchApi.handlers],
      });
      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
});

export {expect};
```

```typescript
// e2e/smoke.spec.ts
import {test, expect} from './fixtures.js';

test('sample loads and renders results', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('#search-box input')).toBeVisible();
  await expect(page.locator('#result-list .result-item').first()).toBeVisible();
});
```

Required devDependencies:

```json
{
  "devDependencies": {
    "@playwright/test": "catalog:",
    "@coveo/platform-mock-api": "workspace:*",
    "@msw/playwright": "catalog:",
    "msw": "catalog:"
  }
}
```

> **Note:** `@msw/playwright` and `msw` must be added to the pnpm catalog (`pnpm-workspace.yaml`) if not already present.

### 5. Keep it minimal

- Include only files necessary for the demonstration
- Keep styling minimal and unbranded: a clean, functional look comparable to a default Atomic experience is fine, but avoid heavy custom themes, design-system integrations, or complex layouts
- No advanced configuration beyond what works with the sample org
- Use default/vanilla field values

## What Belongs in a Sample

### Headless Search

At minimum: search box, result list, pager. Should also include facets and sort for a more complete demonstration.

### Headless Commerce

- 1 search page
- 1+ product listing pages
- 1 recommendations section

### Atomic Search

Include every relevant component with minimal configuration. Use fields available in the `searchuisamples` organization.

### Atomic Commerce

- 1 search page
- 2 product listing pages
- 1 recommendations page

## Framework Version Support

Officially support **current and immediate previous major versions** of Angular, React, and Next.js.

## Relationship to Scaffolding

When a developer runs:

```bash
npm create @coveo/ui my-project -- --template headless-search
```

The CLI downloads and extracts the corresponding published `@coveo/ui-kit-sample-<name>` package as their project starter. This is why samples must be:

- **Zero-config**: Works immediately after `npm install`
- **Self-contained**: No dependencies on the monorepo structure at runtime
- **Tested**: Smoke tests give confidence the template works

## Standard Script Contract

CI discovers samples through Turbo tasks, so scripts must follow this contract. Adding a sample that respects it requires **no CI changes**.

| Script  | Required | Command           | Purpose                                                 |
| ------- | -------- | ----------------- | ------------------------------------------------------- |
| `dev`   | yes      | start dev server  | Local development and the scaffolded starter experience |
| `build` | yes      | production build  | Built by the `build`/`affected` pipeline                |
| `e2e`   | yes      | `playwright test` | Run by the single affected-driven `samples-e2e` CI job  |
| `test`  | optional | `vitest run`      | Unit tests; run by `turbo test --affected` when present |

Rules:

- Playwright tests go under the **`e2e`** script (never `test`). `test` is reserved for unit tests so the two CI lanes stay separate.
- **Atomic-React exception:** samples that consume `@coveo/atomic-react` assets may add a `build:assets` step (copying `dist/assets`, `dist/lang`, `dist/themes`) and call it from a `predev`/`build` hook. This is the only permitted deviation from the standard scripts.

## How Samples Are Tested in CI

- **Build & unit tests** are already affected-driven: `turbo build --affected` and `turbo test --affected` pick up any sample automatically.
- **E2E** runs through a single `samples-e2e` job that executes `turbo run e2e --affected` inside the Playwright container. Because a sample that depends on `@coveo/headless` or `@coveo/atomic` is automatically marked affected when those libraries change, a library change that breaks a sample is caught immediately, and adding a new sample needs **zero** CI edits.

## Testing Locally

From the sample directory:

```bash
pnpm install
pnpm dev             # Verify it runs
pnpm e2e             # Verify Playwright tests pass
```

From the monorepo root, linting must also pass:

```bash
pnpm run lint:check
```
