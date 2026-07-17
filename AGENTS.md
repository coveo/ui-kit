# AGENTS.md

## Prerequisites

- **Node.js**: Version pinned in `.nvmrc` (use `nvm use` or the devcontainer)
- **pnpm**: Pinned in `package.json` `packageManager` field. Run `corepack enable` to activate it

## Commands

- **Build all packages**: `pnpm run build`
- **Run all unit tests in all packages**: `pnpm run test`
- **Check for linting errors across the monorepo**: `pnpm run lint:check`
- **Fix linting errors across the monorepo**: `pnpm run lint:fix`
- **Add a changeset**: `pnpm changeset`

## Packages

<!-- AUTO-GENERATED: run `pnpm run generate:agents-md-packages` to update this section. Do not edit by hand. -->

### Public

- [`@coveo/atomic`](packages/atomic/): A web-component library for building modern UIs interfacing with the Coveo platform
- [`@coveo/atomic-angular`](packages/atomic-angular/projects/atomic-angular/): An Angular component library for building modern UIs interfacing with the Coveo platform, wrapping the core Atomic web components
- [`@coveo/atomic-hosted-page`](packages/atomic-hosted-page/): Web Component used to inject a Coveo Hosted Search Page in the DOM.
- [`@coveo/atomic-legacy`](packages/atomic-legacy/): Package used internally by @coveo/atomic for components using legacy technologies (e.g., Stencil). This package is not intended for public use.
- [`@coveo/atomic-react`](packages/atomic-react/): React specific wrapper for the Atomic component library
- [`@coveo/auth`](packages/auth/): Functions to help authenticate with the Coveo platform.
- [`@coveo/bueno`](packages/bueno/): A simple validator
- [`@coveo/create-atomic`](packages/create-atomic/): Coveo Atomic Generator
- [`@coveo/create-atomic-component`](packages/create-atomic-component/): Initialize a Coveo Atomic Component
- [`@coveo/create-atomic-component-project`](packages/create-atomic-component-project/): Initialize a Coveo Atomic Library Project
- [`@coveo/create-atomic-result-component`](packages/create-atomic-result-component/): Initialize a Coveo Atomic Result Component
- [`@coveo/create-atomic-rollup-plugin`](packages/create-atomic-rollup-plugin/): Rollup plugin for resolving Coveo Atomic dependencies from CDN or npm
- [`@coveo/create-ui`](packages/create-ui/): Scaffold a Coveo UI project (Atomic or Headless) from the official samples.
- [`@coveo/headless`](packages/headless/): A headless library for building search experiences on the Coveo platform
- [`@coveo/headless-react`](packages/headless-react/): React utilities for SSR (Server Side Rendering) with headless
- [`@coveo/quantic`](packages/quantic/): A Salesforce Lightning Web Component (LWC) library for building modern UIs interfacing with the Coveo platform
- [`@coveo/relay`](packages/relay/): A library for sending analytics events using Coveo's Event protocol.
- [`@coveo/shopify`](packages/shopify/): Utilities to integrate Shopify with Coveo's commerce engine
- [`@coveo/thermidor`](packages/thermidor/): Experimental package for a unified, framework-agnostic headless engine for search and conversational experiences

### Private

- [`@coveo/atomic-a11y`](packages/atomic-a11y/): Accessibility utilities and tools for Coveo Atomic components
- [`@coveo/atomic-angular-builder`](packages/atomic-angular/): Angular workspace used to build and publish the @coveo/atomic-angular package
- [`@coveo/atomic-cdn-smoke`](packages/atomic-cdn-smoke/): CDN visual smoke tests for Atomic components using Playwright + Chromatic
- [`@coveo/create-atomic-template`](packages/create-atomic-template/): Template project scaffolded by @coveo/create-atomic when generating a new Atomic search page
- [`@coveo/documentation`](packages/documentation/): Typedoc plugin enforcing Coveo's documentation styling and navigation conventions across the monorepo
- [`@coveo/mock-converse-api`](packages/mock-converse-api/): HTTP server exposing mock Converse API endpoints, built on @coveo/platform-mock-api, for local development and testing
- [`@coveo/pkg-new-template`](packages/pkg-new-template/): Preview app used by pkg.pr.new to let reviewers try out Atomic and Headless builds from a pull request
- [`@coveo/platform-mock-api`](packages/platform-mock-api/): Coveo Platform API mock layer for testing (search, commerce, insight, recommendations)
- [`@coveo/relay-playground`](packages/relay-playground/): Next.js playground app for manually testing and exploring the @coveo/relay analytics library

## Technology

- **End-to-end testing**: Playwright
- **Monorepo management**: Turbo
- **Unit testing**: Vitest
- **Package management**: pnpm
- **Versioning and changelogs**: Changesets

## Boundaries

**You must ALWAYS**:

- Discover available Agent Skills under `.agents/skills` when beginning a new session
- Add a changeset file when modifying source code of any public package
- Run `pnpm run lint:fix` before committing work
- Use the Conventional Commits 1.0.0 specification when composing a commit message

---

**You must ASK BEFORE**:

- Adding a new dependency in the monorepo
- Introducing a potentially breaking change

---

**You must NEVER**:

- Commit unencrypted API keys, secrets, or Personally Identifiable Information (PII)
- Write inline comments that restate what the code is doing
