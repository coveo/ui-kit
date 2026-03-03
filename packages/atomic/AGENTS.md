# Atomic Package AGENTS.md

## Atomic Package Commands

The following commands are specific to the Atomic Package:

- **Build the Atomic package**: `pnpm turbo build --filter=@coveo/atomic`
- **Run all Atomic unit tests**: `pnpm turbo test --filter=@coveo/atomic`
- **Run a specific unit test suite**: `npx vitest run <relative/path/to/test-suite.spec.ts>`
- **Run the Atomic and Storybook dev servers**: `pnpm turbo dev --filter=@coveo/atomic`
- **Run all Atomic end-to-end tests**: `npx playwright test`
- **Run a specific end-to-end test suite**: `npx playwright test -g <test-suite.e2e.ts>`

**Notes**:
- By default, the Atomic and Storybook dev servers run on port 3333 and 4400 respectively
- End-to-end testing commands must be executed from `/packages/atomic` while the Storybook server is running

## Atomic Package Structure

```
packages/atomic/
├── csp/                     # CSP compliance testing
├── dev/                     # Local dev server & examples
├── fake-loader/             # Build artifact for development
├── playwright-utils/        # Page object base classes
├── scripts/                 # Build & code generation scripts
├── src/                     # Source code
│   ├── autoloader/          # Dynamic component loading
│   ├── components/          # UI components
│   │   ├── commerce/        # Commerce components
│   │   ├── common/          # Shared components
│   │   ├── insight/         # Insight panel components
│   │   ├── ipx/             # In-product Experience components
│   │   ├── recommendations/ # Recommendation components
│   │   └── search/          # Search components
│   ├── converters/          # Property type converters
│   ├── decorators/          # Component decorators
│   ├── directives/          # Lit directives
│   ├── global/              # Global styles & environment
│   ├── images/              # Image assets
│   ├── mixins/              # Reusable component mixins
│   ├── themes/              # CSS themes
│   ├── types/               # TypeScript definitions
│   └── utils/               # Shared utilities
├── storybook-pages/         # Sample pages for Storybook
├── storybook-utils/         # Storybook helpers & mocks
└── vitest-utils/            # Test setup & helpers
```

## Atomic Package Technology

In addition to the technology listed in the root `AGENTS.md` file, the following technology is used in the Atomic package:

- **Visual regression testing**: Chromatic v13
- **Datetime formatting**: DayJS v1
- **Localization**: i18n v25
- **Framework**: Lit v3
- **Network call mocking**: MSW v2
- **Interactive documentation**: Storybook v10
- **Styling**: TailwindCSS v4

## Atomic Package Boundaries

In addition to the boundaries listed in the root `AGENTS.md` file, the following boundaries apply when working in the Atomic package:

**You must ALWAYS**
- Add unit tests in the corresponding test suite (`.spec.ts`) when:
  - Adding a new feature or behavior
  - Fixing a bug in an existing feature or behavior
- Use path aliases for imports (except SVG imports)

---

**You must ASK BEFORE**
- Modifying:
  - `packages/atomic/playwright.config.ts`
  - `packages/atomic/rollup.config.js`

---

**You must NEVER**
- Modify `packages/atomic/collection-manifest.json` directly (automatically updated)
