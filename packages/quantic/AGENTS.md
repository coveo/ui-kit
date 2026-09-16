# Quantic Package AGENTS.md

## Quantic Package Commands

- **Check for linting errors**: `pnpm --filter @coveo/quantic run lint:check`
- **Fix linting and formatting errors**: `pnpm --filter @coveo/quantic run lint:fix`

## Quantic Package Linting and Formatting

Quantic does **not** use oxlint or oxfmt like the rest of the monorepo. When working
anywhere under `packages/quantic`, the following tools apply:

- **Linting**: ESLint (configured in `.eslintrc.json`, using `@salesforce/eslint-config-lwc`)
- **Formatting**: Prettier (configured in `.prettierrc.js`, including `prettier-plugin-apex` for `.cls` and `.trigger` files)

**You must NEVER**:

- Use oxlint, oxfmt, or Biome to lint or format files in this package.

Always lint and format by running the package `lint:check` / `lint:fix` scripts rather
than invoking a linter or formatter binary directly.
