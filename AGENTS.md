# AGENTS.md

## Commands

- **Build all packages**: `pnpm run build`
- **Run all unit tests in all packages**: `pnpm run test`
- **Check for linting errors across the monorepo**: `pnpm run lint:check`
- **Fix linting errors across the monorepo**: `pnpm run lint:fix`
- **Add a changeset**: `pnpm changeset`

## Structure

Public packages:

- `packages/atomic/`: Web-component library for building modern UIs interfacing with the Coveo platform; built on top of headless
- `packages/atomic-react/`: React wrapper for the Atomic component library
- `packages/atomic-hosted-page/`: Web component for injecting a Coveo Hosted Search Page in the DOM
- `packages/atomic-legacy/`: Internal package used by `@coveo/atomic` for legacy Stencil components
- `packages/auth/`: Functions to help authenticate with the Coveo platform
- `packages/bueno/`: Value validation library
- `packages/headless/`: Redux-based headless library; built on top of the Coveo REST APIs
- `packages/headless-react/`: React utilities for SSR with headless
- `packages/quantic/`: Salesforce Lightning Web Component library; built on top of headless
- `packages/shopify/`: Coveo integration for Shopify storefronts
- `packages/create-atomic/`: Generator for new Atomic projects
- `packages/create-atomic-component/`: Generator for new Atomic components
- `packages/create-atomic-component-project/`: Generator for new Atomic component library projects
- `packages/create-atomic-result-component/`: Generator for new Atomic result components
- `packages/create-atomic-rollup-plugin/`: Rollup plugin for resolving Atomic dependencies from CDN or npm

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
