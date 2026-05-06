# Contributing to UI-Kit Samples

This guide outlines the conventions and requirements for creating and maintaining samples in the ui-kit repository.

## Dual Purpose: Samples & Scaffolding Starters

Every sample in this directory serves two roles:

1. **Living documentation** — Demonstrates correct usage of Coveo libraries.
2. **Scaffolding template** — Used by `npm create @coveo/ui` to bootstrap new projects.

This means every sample must be **self-contained, zero-config, and runnable out of the box** without any Coveo platform credentials or OAuth setup.

## Sample Requirements

Every sample **must** have:

| Requirement | Details |
| --- | --- |
| **No credentials needed** | Use the `searchuisamples` demo organization with sample credentials. No OAuth, no API keys, no search tokens. |
| **`npm install && npm run dev` works** | A developer should be able to clone and run the sample with no additional setup. |
| **README.md** | Purpose, how to run, key features demonstrated. |
| **Playwright smoke tests** | At least one test verifying the sample loads and renders expected content. |
| **Minimal configuration** | No custom styling, no complex initialization. Use vanilla fields that work with the sample org. |
| **Single purpose** | Each sample focuses on one library + framework combination. |

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
<category>/<use-case>[-<framework>]
```

**Examples:**

- `atomic/search` — Vanilla Atomic search (HTML/JS, no framework)
- `atomic/commerce-react` — Atomic React commerce
- `headless/search-react` — Headless search with React
- `headless-ssr/commerce-nextjs` — Headless SSR commerce with Next.js

**Package name in `package.json`:**

```
@coveo/sample-<category>-<use-case>[-<framework>]
```

### Guidelines

- Use **kebab-case** for all names
- **Use cases**: `search`, `commerce`
- **Framework names**: `react`, `angular`, `nextjs`, `vuejs`
- Vanilla (no-framework) samples omit the framework suffix

## Creating a New Sample

### 1. Choose the correct category

- **`atomic/`** — Uses `@coveo/atomic` or `@coveo/atomic-react` components
- **`headless/`** — Uses `@coveo/headless` controllers with client-side rendering
- **`headless-ssr/`** — Uses `@coveo/headless-react` or similar with server-side rendering

### 2. Use sample credentials

All samples connect to the `searchuisamples` organization. No authentication flow, no environment variables to configure.

```typescript
// Atomic
await searchInterface.initialize(getSampleSearchEngineConfiguration());

// Headless
import { getSampleSearchEngineConfiguration } from '@coveo/headless';
```

### 3. Write a README.md

Include:
- **Purpose** — One-liner on what the sample demonstrates
- **Prerequisites** — Node version, etc.
- **Running** — `npm install && npm run dev`
- **Key features** — What components/controllers are showcased

### 4. Add Playwright smoke tests

Every sample must include at least one Playwright test that:
- Starts the dev server
- Verifies the page loads without errors
- Checks that key UI elements render (e.g., search box, results)

This acts as a safety net: if a library change breaks a sample, it likely introduced a breaking change.

```typescript
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('sample loads and renders results', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('atomic-search-box')).toBeVisible();
  await expect(page.locator('atomic-result-list')).toBeVisible();
});
```

### 5. Keep it minimal

- Include only files necessary for the demonstration
- No custom CSS themes or complex layouts
- No advanced configuration beyond what works with the sample org
- Use default/vanilla field values

## What Belongs in a Sample

### Atomic Search

Include every relevant component with minimal configuration. Use fields available in the `searchuisamples` organization.

**Include:** search box, instant results, recent queries, facets (automatic, category, numeric, rating, timeframe), tabs, sort, breadbox, smart snippets, generated answer, result templates, pagination.

**Exclude:** `atomic-external`, `atomic-html`, format components (unless demonstrating a facet that needs them).

### Atomic Commerce

- 1 search page
- 2 product listing pages
- 1 recommendations page

### Headless Samples

At minimum: search box, result list, pager. Can include facets and sort for a more complete demonstration.

## Framework Version Support

Officially support **current and immediate previous major versions** of Angular, React, and Next.js.

## Relationship to Scaffolding

When a developer runs:

```bash
npm create @coveo/ui my-project -- --atomic-search-react
```

The CLI clones the corresponding sample (`samples/atomic/search-react`) as their project starter. This is why samples must be:

- **Zero-config** — Works immediately after `npm install`
- **Self-contained** — No dependencies on the monorepo structure
- **Tested** — Smoke tests give confidence the template works

## Testing Locally

From the sample directory:

```bash
npm install
npm run dev          # Verify it runs
npx playwright test  # Verify smoke tests pass
```

From the monorepo root, linting and knip must also pass:

```bash
pnpm run lint:check
pnpm run knip
```
