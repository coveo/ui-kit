# Contributing to UI-Kit Samples

This guide outlines the conventions and requirements for creating and maintaining samples in the ui-kit repository.

## Dual Purpose: Samples & Scaffolding Starters

Every sample in this directory serves two roles:

1. **Living documentation** — Demonstrates correct usage of Coveo libraries.
2. **Scaffolding template** — Used by `npm create @coveo/ui` to bootstrap new projects.

This means every sample must be **self-contained, zero-config, and runnable out of the box** without any Coveo platform credentials or OAuth setup.

## Sample Requirements

Every sample **must** have:

| Requirement                          | Details                                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-configured credentials**       | Use the `searchuisamples` demo organization with the embedded public sample access token. No OAuth flow, no `.env` file, no user-provided credentials. |
| **`pnpm install && pnpm dev` works** | A developer should be able to clone and run the sample with no additional setup. New samples must use a `dev` script.                                  |
| **README.md**                        | Purpose, prerequisites, how to run, key features demonstrated.                                                                                         |
| **Playwright smoke tests with MSW**  | At least one test verifying the sample loads and renders expected content, using `@coveo/platform-mock-api` for deterministic responses.               |
| **Minimal configuration**            | No custom styling, no complex initialization. Use vanilla fields that work with the sample org.                                                        |
| **Single purpose**                   | Each sample focuses on one library + framework combination.                                                                                            |

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

- `headless/search-vite` — Vanilla headless search (JS + Vite)
- `headless/commerce-react` — Headless commerce with React
- `headless-ssr/commerce-nextjs` — Headless SSR commerce with Next.js
- `headless-ssr/commerce-nextjs-v4` — Variant for Headless V4 preview
- `atomic/search-commerce-angular` — Combined search + commerce in Angular

**Package name in `package.json`:**

```
@samples/<category>-<use-case>[-<framework>][-<variant>]
```

### Guidelines

- Use **kebab-case** for all names
- **Use cases**: `search`, `commerce`, `search-commerce` (combined)
- **Framework names**: `react`, `angular`, `nextjs`, `vuejs`
- **Variant suffixes**: `-v4`, `-app-router`, etc. for alternative implementations
- Vanilla (no-framework) samples use `-vite` as the framework suffix (e.g., `search-vite`)

## Creating a New Sample

### 1. Choose the correct category

- **`atomic/`** — Uses `@coveo/atomic` or `@coveo/atomic-react` components
- **`headless/`** — Uses `@coveo/headless` controllers with client-side rendering
- **`headless-ssr/`** — Uses `@coveo/headless-react` or similar with server-side rendering

### 2. Use sample credentials

All samples connect to the `searchuisamples` organization using the public sample access token. No authentication flow, no environment variables to configure.

```typescript
// Headless Search — uses embedded sample token
import {getSampleSearchEngineConfiguration} from '@coveo/headless';

// Headless Commerce — uses explicit public sample token
import {buildCommerceEngine} from '@coveo/headless/commerce';
// accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457', organizationId: 'searchuisamples'
```

### 3. Write a README.md

Include:

- **Purpose** — One-liner on what the sample demonstrates
- **Template name** — The scaffolding template identifier
- **Prerequisites** — Node version, pnpm
- **Running** — `pnpm install && pnpm dev`
- **Key features** — What components/controllers are showcased

### 4. Add Playwright smoke tests with `@coveo/platform-mock-api`

Every sample must include Playwright tests that use the internal `@coveo/platform-mock-api` package (at `packages/platform-mock-api`) and `@msw/playwright` for network mocking. This ensures tests are:

- **Deterministic** — No flakiness from live API calls
- **Fast** — No network latency
- **CI-friendly** — No dependency on external services

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
- No custom CSS themes or complex layouts
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

The CLI clones the corresponding sample as their project starter. This is why samples must be:

- **Zero-config** — Works immediately after `npm install`
- **Self-contained** — No dependencies on the monorepo structure at runtime
- **Tested** — Smoke tests give confidence the template works

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
- **E2E** runs through a single `samples-e2e` job that executes `turbo run e2e --affected` inside the Playwright container. Because a sample that depends on `@coveo/headless` or `@coveo/atomic` is automatically marked affected when those libraries change, a library change that breaks a sample is caught immediately — and adding a new sample needs **zero** CI edits.

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
