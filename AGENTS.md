# AGENTS.md

## Commands

- **Build all packages**: `pnpm run build`
- **Run all unit tests in all packages**: `pnpm run test`
- **Check for linting errors across the monorepo**: `pnpm run lint:check`
- **Fix linting errors across the monorepo**: `pnpm run lint:fix`
- **Add a changeset**: `pnpm changeset`

## Structure

- `packages/atomic/`: Lit-based Atomic component library; built on top of headless
- `packages/headles/`: Redux-based Headless library; built on top of the Coveo REST APIs
- `packages/quantic/`: Salesforce Lightning component library; built on top of headless

## Technology

- **End-to-end testing**: Playwright
- **Monorepo management**: Turbo
- **Unit testing**: Vitest
- **Package management**: pnpm
- **Versioning and changelogs**: [Changesets](https://github.com/changesets/changesets) — see `.changeset/config.json` for configuration

## Boundaries

**You must ALWAYS**:

- Discover available Agent Skills under `.agents/skills` when beginning a new session
- Add a changeset file when modifying source code of any public package (invoke the `adding-changesets` skill for guidance)
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
