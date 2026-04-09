# Atomic Package AGENTS.md

## Atomic Package Commands

- **Build the Atomic package**: `pnpm turbo build --filter=@coveo/atomic`
- **Run all Atomic unit tests**: `pnpm turbo test --filter=@coveo/atomic`
- **Run a specific unit test suite**: `npx vitest run <relative/path/to/test-suite.spec.ts>`
- **Run the Atomic and Storybook dev servers**: `pnpm turbo dev --filter=@coveo/atomic`
- **Run all Atomic end-to-end tests**: `npx playwright test`
- **Run a specific end-to-end test suite**: `npx playwright test -g <test-suite.e2e.ts>`

**Notes**:
- By default, Storybook dev server run on http://storybook.localhost:1355
- End-to-end testing commands must be executed from `packages/atomic/` while the Storybook server is running

## Atomic Package Structure

- `src/components/commerce/` - Components exclusive to the commerce use-case
- `src/components/common/` - Shared components across all interfaces
- `src/components/insight/` - Components exclusive to the Insight use-case
- `src/components/ipx/` - Components exclusive to the In-Product Experience use case
- `src/components/recommendations/` - Components exclusive to the Recommendations use case
- `src/components/search/` - Components exclusive to the search use-case

## Atomic Package Technology

In addition to the technology listed in the root `AGENTS.md` file, the following technology is used in the Atomic package:

- **Visual regression testing**: Chromatic
- **Datetime formatting**: DayJS
- **Localization**: i18n
- **Framework**: Lit
- **Network call mocking**: MSW
- **Interactive documentation**: Storybook
- **Styling**: TailwindCSS

## Atomic Package Boundaries

In addition to the boundaries listed in the root `AGENTS.md` file, the following boundaries apply when working in the Atomic package:

**You must ALWAYS**:

- Add unit tests in the corresponding test suite (`.spec.ts`) when:
  - Adding a new feature or behavior
  - Fixing a bug in an existing feature or behavior
- Use relative paths (e.g., `./local-helper`) for same-directory imports
- Use path aliases (e.g., `@/src/components/common/button`) for imports outside of the current file's directory
