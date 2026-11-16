# Quantic Package AGENTS.md

## Quantic Package Commands

- **Check for linting errors**: `pnpm --filter @coveo/quantic run lint:check`
- **Fix linting and formatting errors**: `pnpm --filter @coveo/quantic run lint:fix`

## Quantic Package Linting and Formatting

Quantic's source does **not** use oxlint or oxfmt like the rest of the monorepo (only its top-level `*.json` files and `catalog-info.yaml` are formatted by the root oxfmt config). For everything else under `packages/quantic`, the following tools apply:

- **Linting**: ESLint 9 flat config (configured in `eslint.config.js`, using `@salesforce/eslint-config-lwc`)
- **Formatting**: Prettier (configured in `.prettierrc.js`, including `prettier-plugin-apex` for `.cls` and `.trigger` files)

Don't run oxlint, oxfmt, or Biome directly on files in this package.

Always lint and format by running the package `lint:check` / `lint:fix` scripts rather
than invoking a linter or formatter binary directly.
