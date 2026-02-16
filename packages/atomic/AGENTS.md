# Atomic AGENTS.md

When working in the Atomic package, you must follow these instructions in addition to those found in the `AGENTS.md` file at the root of the monorepo.

## Atomic Package Commands

- **Build the Atomic package**: `pnpm turbo @coveo/atomic#build`
- **Run all Atomic unit tests**: `pnpm turbo @coveo/atomic#test`
- **Run a specific unit test suite**: `npx vitest run <relative/path/to/test-suite.spec.ts>`
- **Run the Atomic and Storybook dev servers**: `pnpm turbo @coveo/atomic#dev`

**Executable only from `/packages/atomic`, and only when the Storybook server is running**:
- **Run all Atomic end-to-end tests**: `npx playwright test`
- **Run a specific end-to-end test suite**: `npx playwright test -g <test-suite.e2e.ts>`

**Note**: Atomic unit test and end-to-end tests do not depend on each other. Only end-to-end tests require the Storybook dev server.

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

### Atomic Component Structure

atomic-{component-name}/
├── atomic-{component-name}.ts              # Main component (Lit)
├── atomic-{component-name}.tw.css.ts       # Styles (Tailwind; optional)
├── atomic-{component-name}.spec.ts         # Unit tests (Vitest)
├── atomic-{component-name}.mdx             # Public documentation (Storybook)
├── atomic-{component-name}.new.stories.tsx # Stories (Storybook)
├── e2e/                                    # E2E tests (Playwright)
│   ├── atomic-{component-name}.e2e.ts      # Test suite
│   ├── page-object.ts                      # Page object
│   └── fixture.ts                          # Test fixtures
└── *.ts                                    # Supporting files (optional)

**Component variations:**
- The `.tw.css.ts` file is only included when complex styles are required; otherwise component styles are usually set directly in the Lit component's static `styles` property
- Complex components may have multiple `.ts` helper files
- Internal components may lack the `e2e/` directory

## Atomic Package Technology

- **Visual regression testing**: Chromatic v13
- **Datetime formatting**: DayJS v1
- **Localization**: i18n v25
- **Framework**: Lit v3
- **Network call mocking**: MSW v2
- **Interactive documentation**: Storybook v10
- **Styling**: TailwindCSS v4

## Atomic Package Boundaries

**You must ALWAYS**:
- Add unit tests in the corresponding test suite (`.spec.ts`) when:
  - Adding a new feature or behavior
  - Fixing a bug in an existing feature or behavior
- Use path aliases for imports (except SVG imports)

**You must ASK BEFORE**:
- Modifying:
  - `packages/atomic/playwright.config.ts`
  - `packages/atomic/rollup.config.js`

**You must NEVER**:
- Modify `packages/atomic/collection-manifest.json` directly (automatically updated)
