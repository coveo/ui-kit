# Atomic Package AGENTS.md

## Atomic Package Commands

- **Build the Atomic package**: `pnpm turbo build --filter=@coveo/atomic`
- **Run all Atomic unit tests**: `pnpm turbo test --filter=@coveo/atomic`
- **Run a specific unit test suite**: `npx vitest run <relative/path/to/test-suite.spec.ts>`
- **Run the Atomic and Storybook dev servers**: `pnpm turbo dev --filter=@coveo/atomic`
- **Run all Atomic end-to-end tests**: `npx playwright test`
- **Run a specific end-to-end test suite**: `npx playwright test -g <test-suite.e2e.ts>`

**Notes**:
- By default, the Atomic and Storybook dev servers run on port 3333 and 4400 respectively
- End-to-end testing commands must be executed from `packages/atomic/` while the Storybook server is running

## Atomic Package Structure

- `src/components/commerce/`: Commerce components (`atomic-commerce-*`)
- `src/components/common/`: Shared components (mainly functional components)
- `src/components/insight/`: Insight panel components (`atomic-insight-*`)
- `src/components/ipx/`: In-Product Experience components (`atomic-ipx-*`)
- `src/components/recommendations/`: Recommendations components (`atomic-recs-*`)
- `src/components/search/`: Search components (`atomic-*`)

### Atomic Component Folder Structure

`atomic-{component-name}/`
- `atomic-{component-name}.ts`: Main component (Lit)
- `atomic-{component-name}.tw.css.ts`: Styles (Tailwind; optional)
- `atomic-{component-name}.spec.ts`: Unit tests (Vitest)
- `atomic-{component-name}.mdx`: Public Docs page (Storybook)
- `atomic-{component-name}.new.stories.tsx`: Stories (Storybook)
- `e2e/`: End-to-end tests (Playwright; optional)
  - `atomic-{component-name}.e2e.ts`: E2E test suite
  - `page-object.ts`: Page object for E2E test suite
  - `fixture.ts`: Fixture for E2E test suite   
- `*.ts`: Supporting files (optional)

**Notes**:
- The `.tw.css.ts` file is only included when complex styles are required; otherwise component styles are usually set directly in the Lit component's static `styles` property
- Internal components may lack the `e2e/` directory
- Complex components may have one or more `.ts` helper files

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
- Use path aliases for imports (except SVG imports)
