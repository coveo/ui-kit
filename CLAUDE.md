# UI-Kit Project Instructions

This document provides OpenCode with context about the Coveo UI-Kit repository conventions, patterns, and standards.

## Repository Overview

**Coveo UI-Kit** is a monorepo containing search, commerce, and recommendation UI components:

| Package | Description |
|---------|-------------|
| `packages/atomic` | Web Components (Lit + legacy Stencil) for search/commerce UIs |
| `packages/headless` | Framework-agnostic state management (Redux-like) |
| `packages/quantic` | Salesforce Lightning Web Components |
| `packages/atomic-react`, `packages/atomic-angular` | Framework wrappers |
| `packages/bueno` | Runtime schema validation |

**Tech Stack:** TypeScript, Lit, Stencil (legacy), Tailwind CSS, Vitest, Playwright, Cypress (legacy)

**Build System:** Turbo monorepo, pnpm workspaces

## Core Principles

**Correctness over helpfulness.** Do not blindly follow user comments or incomplete code. When intention is unclear or flawed, suggest safer alternatives.

**Favor established, idiomatic practices.** Default to patterns that are widely accepted, maintainable, and backed by documentation.

**Self-documenting code over inline comments.** Use descriptive names and clear structure. Inline comments only for complex business logic, non-obvious decisions, or lint justifications.

**Public API documentation is required.** Use JSDoc for components, exported functions, and public methods.

## Defensive Programming

- **Try-catch blocks** for operations that may fail (network requests, JSON parsing, external API calls)
- **Error state management** - set component `error` property when validation/initialization fails
- **Input validation** with schema validators (Bueno schemas in `ValidatePropsController`)
- **Error guard decorators** (`@errorGuard`) for component render methods
- **Resource cleanup** in disconnection/unmount handlers

## TypeScript Standards

### Type Safety

**Avoid `any` types.** Use union types, generics, or conditional types.

**When `any` is required** (third-party APIs, complex type constraints):
- Add `// biome-ignore lint/suspicious/noExplicitAny: <reason>` comment
- Document the external constraint

**Type assertions** (`as Type`) are acceptable for:
- Narrowing union types with runtime guarantees
- Test fixtures with intentionally invalid data (`as unknown as Type`)
- Working around temporary type system limitations

### Import Organization

**Use path aliases** when both conditions are met:
1. The package `tsconfig.json` defines path mappings (check `compilerOptions.paths`)
2. Importing from **outside the current file's directory** (any `../` import)

**Use relative imports** only for same-directory imports (`./local-file`)

```typescript
// ✅ Correct: Path aliases for anything outside current directory
import {bindings} from '@/src/decorators/bindings';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';

// ✅ Correct: Relative for same-directory files
import {localHelper} from './local-helper';

// ❌ Incorrect: Relative paths leaving current directory
import {renderButton} from '../../../common/button';
```

---

## Atomic Package (packages/atomic)

**All new Atomic components must be Lit components, not Stencil.**

### Component Directory Structure

Components live in `src/components/` organized by use case:
- `/commerce` - Commerce use-case exclusive
- `/common` - Shared across all interfaces
- `/search` - Search use-case exclusive
- `/insight`, `/ipx`, `/recommendations` - Other use cases

### Lit Component Files

Each component has an `atomic-*` directory with:
- `atomic-name.ts` - Main component
- `atomic-name.tw.css.ts` - Tailwind styles (optional)
- `atomic-name.spec.ts` - Unit tests
- `atomic-name.mdx` - Documentation
- `atomic-name.new.stories.tsx` - Storybook stories
- `e2e/atomic-name.e2e.ts` - E2E tests
- `e2e/fixture.ts` - E2E test setup
- `e2e/page-object.ts` - E2E interaction layer

### Naming Conventions

- Component tag: `atomic-kebab-case` (e.g., `atomic-search-box`)
- File names: `atomic-kebab-case.ts` (match tag name)
- Class names: `AtomicPascalCase` (e.g., `AtomicSearchBox`)

### Component Implementation

**Generate new components:**
```bash
node scripts/generate-component.mjs component-name src/components/common
```

**Decorators:**
- `@customElement('atomic-element-name')` - Always required
- `@bindings()` - Only if component requires engine/interface bindings
- `@withTailwindStyles` - Only for shadow DOM components with Tailwind styles

**Multi-word properties:** Use kebab-case attributes explicitly:
```typescript
@property({type: String, attribute: 'entity-to-greet'}) entityToGreet: string;
```

### Class Field Declaration Order

1. `static styles` - Immediately after class declaration
2. `@property` decorated fields (public properties)
3. `@state` decorated fields (bindings, error, controller-bound state, private state)
4. Non-decorated fields (controllers, refs, etc.)

### Method Declaration Order

1. Custom element lifecycle: `constructor`, `connectedCallback`, `disconnectedCallback`, `adoptedCallback`, `attributeChangedCallback`
2. Public methods/getters (`initialize` first, then alphabetical)
3. Lit reactive lifecycle: `shouldUpdate`, `willUpdate`, `update`, `render`, `firstUpdated`, `updated`
4. Private methods/getters

### Rendering with Lit Directives

Use Lit directives for conditional rendering:

```typescript
import {when} from 'lit/directives/when.js';
import {nothing} from 'lit';

render() {
  return html`
    ${when(
      this.isVulcan,
      () => html`🖖 ${this.entityToGreet}!`,
      () => html`👋 ${this.entityToGreet}!`
    )}
  `;
}
```

### Property Validation

Use `ValidatePropsController` in constructor:

```typescript
constructor() {
  super();
  new ValidatePropsController(
    this,
    () => ({pathLimit: this.pathLimit}),
    new Schema({
      pathLimit: new NumberValue({min: 1, required: false}),
    })
  );
}
```

---

## Testing Standards

### General Principles

- **Test one behavior per test case**
- **Descriptive test names** starting with "should"
- **Focused assertions** - one logical assertion per test

### Unit Tests (Vitest)

**File naming:** `<module-name>.spec.ts`

**Top-level describe:**
- Components: `'atomic-element-name'`
- Functions: `'#functionName'`
- Controllers: `'ControllerClassName'`

**Imports:**
```typescript
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {html} from 'lit';
```

**Mock at file top:**
```typescript
vi.mock('@coveo/headless', {spy: true});
```

**Component test pattern:**
```typescript
const renderComponent = async ({props = {}, controllerState = {}} = {}) => {
  vi.mocked(buildController).mockReturnValue(
    buildFakeController({state: controllerState})
  );

  const {element} = await renderInAtomicSearchInterface<ComponentType>({
    template: html`<tag .prop=${props.value}></tag>`,
    selector: 'tag',
  });

  return {
    element,
    button: page.getByRole('button'),
  };
};
```

**Run tests:**
```bash
cd packages/atomic && npx vitest ./src/**/*.spec.ts --run
```

### E2E Tests (Playwright)

**Locators:** Prioritize role-based locators (`getByRole`, `getByLabel`, `getByText`)

**Assertions:** Use auto-retrying web-first assertions (`await expect(locator).toHaveText()`)

**Structure:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
  });

  test('should do something', async ({ page }) => {
    await test.step('Perform action', async () => {
      await page.getByRole('button').click();
    });

    await test.step('Verify result', async () => {
      await expect(page.getByRole('main')).toMatchAriaSnapshot(`...`);
    });
  });
});
```

---

## Accessibility Standards

**Code must conform to WCAG 2.2 Level AA.**

### Key Requirements

- All interactive elements must be keyboard navigable
- Keyboard focus must be clearly visible at all times
- Static elements should not have `tabindex` attribute
- Hidden elements must not be keyboard focusable
- All text must have 4.5:1 contrast ratio (3:1 for large text)
- Color must not be the only way to convey information
- All elements must correctly convey semantics (name, role, value, states)
- Use appropriate landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Use headings (`<h1>` through `<h6>`) in logical hierarchy

### Form Accessibility

- Labels must accurately describe input purpose
- Required fields indicated with asterisk + `aria-required="true"`
- Error messages with `aria-describedby` + `aria-invalid="true"`
- On submit with errors, focus first invalid input

### Graphics and Images

- Informative graphics: provide meaningful `alt` or `aria-label`
- Decorative graphics: use `alt=""` or `aria-hidden="true"`

---

## Storybook & MSW Mocking

**All new components MUST have Storybook stories.**

### Basic Story Pattern

```typescript
import type { Meta, StoryObj as Story } from '@storybook/web-components-vite';
import { MockSearchApi } from '@/storybook-utils/api/search/mock';
import { wrapInSearchInterface } from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const { decorator, play } = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-component-name',
  title: 'Search/ComponentName',
  decorators: [decorator],
  parameters: {
    msw: { handlers: [...searchApiHarness.handlers] },
  },
  play,
};

export default meta;
export const Default: Story = {};
```

### Story-Specific Responses

```typescript
export const NoResults: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
    }));
  },
  play,
};
```

---

## Common Commands

```bash
# From repository root
pnpm install
pnpm build
pnpm lint:fix
pnpm test
pnpm e2e

# From packages/atomic
cd packages/atomic
pnpm test              # Run unit tests
pnpm test:watch        # Watch mode
pnpm e2e               # Run E2E tests
pnpm build:stencil-lit # Build atomic package

# Generate new component
node scripts/generate-component.mjs component-name src/components/common
```

---

## Code Quality Checklist

Before completing work, verify:

- [ ] All imports use `@/*` path aliases (no `../` imports)
- [ ] Unit tests pass: `pnpm test`
- [ ] E2E tests pass: `pnpm e2e`
- [ ] Linting passes: `pnpm lint:fix`
- [ ] Build succeeds: `pnpm build`
- [ ] Accessibility maintained (WCAG 2.2 AA)
- [ ] JSDoc on public APIs
- [ ] Storybook stories created/updated
