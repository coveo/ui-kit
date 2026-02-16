---
agent: 'agent'
description: 'Generate Playwright e2e test suite for an Atomic component'
---

# Generate Playwright E2E Tests for an Atomic Component

Generate end-to-end tests for an Atomic component using Playwright. These tests verify component behavior in a real browser environment with actual Storybook stories.

## Suitable For

**Use Playwright e2e tests for:**
- Components with Storybook stories + interactive behavior
- Molecules/organisms with Headless integration

**Use Vitest instead for:** Atoms, utilities, non-interactive components

## Find Similar Tests (Critical First Step)

Find variant component in other use cases with e2e tests (e.g., `atomic-search-box` → `atomic-commerce-search-box/e2e/`)

**If no similar component exists:** Use commerce variant of any component as reference pattern (e.g., `atomic-commerce-*`)

**Analyze for patterns:**
- Page object: locator types, getter naming
- Fixture: helper functions, route mocking
- Test structure: describe nesting, beforeEach usage, story parameterization

## Migration vs New Component

**For migrations (Stencil→Lit):**
1. Check if `e2e/` directory exists
2. If exists: Verify test quality (see Coverage Checklist), note TypeScript errors as expected
3. If missing or incomplete: Proceed with test creation

**Expected type errors:** `BasePageObject` generic references may error until `npm run build` regenerates JSX types. Non-blocking.

## Workflow

**Existing e2e directory:** Update to match similar component's latest patterns, add missing coverage

**New e2e directory:** Create `page-object.ts`, `fixture.ts`, `*.e2e.ts` following similar component patterns

**After implementation:**
1. Verify no unexpected TypeScript errors (BasePageObject generic errors are expected)

## File Structure

Each component's e2e tests require three files in `e2e/` subdirectory:

```
src/components/{domain}/{component-name}/
  e2e/
    fixture.ts              # Test fixtures & setup
    page-object.ts          # Page Object Model
    {component-name}.e2e.ts # Test suite
```

## Page Object Pattern

**Purpose:** Encapsulate DOM queries and component interactions.

**Import based on component type:**
- Stencil (`.tsx`): `import {BasePageObject} from '@/playwright-utils/base-page-object'` with `<'atomic-name'>` generic
- Lit (`.ts`): `import {BasePageObject} from '@/playwright-utils/lit-base-page-object'` without generic

```typescript
import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';
// or for Lit:
// import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ComponentPageObject extends BasePageObject<'atomic-component'> {
  constructor(page: Page) {
    super(page, 'atomic-component');
  }

  get submitButton() {
    return this.page.getByRole('button', {name: 'Submit'});
  }

  get searchInput() {
    return this.page.getByPlaceholder('Search');
  }

  get heading() {
    return this.page.getByRole('heading', {name: /pattern/i});
  }

  get closeButton() {
    return this.page.getByLabel('Close dialog');
  }

  get placeholder() {
    return this.page.locator('.placeholder');
  }

  item({index, total}: {index?: number; total?: number} = {}) {
    return this.page.getByLabel(
      new RegExp(`item ${index ?? '\\d'} of ${total ?? '\\d'}`)
    );
  }

  async selectOption(value: string) {
    await this.dropdown.click();
    await this.page.getByRole('option', {name: value}).click();
  }
}
```

**Locator preference order:**
1. Shadow parts: `page.locator('[part="title"]')` (for components with shadow DOM parts)
2. Semantic roles: `getByRole('button')`, `getByRole('heading')`
3. Accessible labels: `getByLabel('Close')`, `getByPlaceholder('Search')`
4. Text content: `getByText('Submit')`
5. CSS selectors: `page.locator('.class')` (last resort when semantic unavailable)

**Inherited from `BasePageObject`:**
- `hydrated` - Locator for hydrated component
- `load({story, args})` - Navigate to Storybook story
- `noProducts()` / `noRecommendations()` / `nRecommendations(n)` - Mock results

## Fixture Pattern

**Purpose:** Extend Playwright test with component-specific fixtures and helpers.

```typescript
import {test as base, type Page} from '@playwright/test';
import {ComponentPageObject} from './page-object';

type MyFixtures = {
  component: ComponentPageObject;
};

export async function setSuggestions(page: Page, count: number) {
  await page.route('**/v2/search/querySuggest', async (route) => {
    const completions = Array.from({length: count}, (_, i) => ({
      expression: `suggestion-${i}`,
      highlighted: `suggestion-${i}`,
    }));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({completions}),
    });
  });
}

export async function setLocalStorage(page: Page, key: string, value: unknown) {
  await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [key, value] as const
  );
}

export const test = base.extend<MyFixtures>({
  component: async ({page}, use) => {
    await use(new ComponentPageObject(page));
  },
});

export {expect} from '@playwright/test';
```

## Test File Pattern

```typescript
import {expect, test} from './fixture';

test.describe('atomic-component', () => {
  test.describe('default state', () => {
    test.beforeEach(async ({component}) => {
      await component.load({story: 'default'});
      await component.hydrated.waitFor();
    });

    test('should render primary content', async ({component}) => {
      await expect(component.submitButton).toBeVisible();
      await expect(component.submitButton).toBeEnabled();
    });

    test.describe('when user interacts', () => {
      test.beforeEach(async ({component}) => {
        await component.searchInput.click();
      });

      test('should display interactive elements', async ({component}) => {
        await expect(component.dropdown).toBeVisible();
      });

      test.describe('after selecting option', () => {
        test.beforeEach(async ({component}) => {
          await component.selectOption('Option 1');
        });

        test('should update state', async ({component}) => {
          await expect(component.searchInput).toHaveValue('Option 1');
        });
      });
    });
  });

  test.describe('with custom args', () => {
    test.beforeEach(async ({component}) => {
      await component.load({
        story: 'default',
        args: {placeholder: 'Custom placeholder', disabled: false},
      });
      await component.hydrated.waitFor();
    });

    test('should apply custom configuration', async ({component}) => {
      await expect(component.searchInput).toHaveAttribute(
        'placeholder',
        'Custom placeholder'
      );
    });
  });

  test.describe('with mocked API responses', () => {
    test.beforeEach(async ({component, page}) => {
      await setSuggestions(page, 5);
      await component.load({story: 'default'});
      await component.hydrated.waitFor();
    });

    test('should display mocked data', async ({component}) => {
      await expect(component.item().first()).toBeVisible();
    });
  });
});
```

**Critical patterns:**

- Always wait for `component.hydrated.waitFor()` after `load()`
- Nest `describe` blocks for state progression (setup in `beforeEach`)
- Include accessibility test for each major state
- Use page object getters, never query directly with `page.locator()`
- Avoid hard-coded delays; use `.waitFor()` or visibility assertions

## Test Coverage Checklist

**Critical:**
- [ ] Analyzed similar component's e2e tests
- [ ] Accessibility test for default state
- [ ] Key elements visible/enabled
- [ ] User interactions (clicks, form input)

**Recommended:**
- [ ] State variations (different stories/args)
- [ ] Loading/empty/error states
- [ ] Route mocking for API responses
- [ ] Keyboard navigation

**Optional:**
- [ ] Local storage manipulation
- [ ] Multi-component interaction
- [ ] Responsive behavior

## Route Mocking Examples

**Note:** For error responses, reference component-specific error type files (e.g., `known-error-types.ts`) for valid error type values.

**Commerce search:**
```typescript
await page.route('**/commerce/v2/search', async (route) => {
  const response = await route.fetch();
  const body = await response.json();
  body.products = body.products.slice(0, 3); // Limit results
  await route.fulfill({response, json: body});
});
```

**Search recommendations:**
```typescript
await page.route('**/search/v2?organizationId=*', async (route) => {
  const response = await route.fetch();
  const body = await response.json();
  body.results = []; // Empty results
  body.totalCount = 0;
  await route.fulfill({response, json: body});
});
```

**Query suggestions:**
```typescript
await page.route('**/v2/search/querySuggest', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      completions: [{expression: 'test', highlighted: 'test'}],
    }),
  });
});
```

## Naming Conventions

**Files:**
- `component-name.e2e.ts` (matches component tag name)
- `page-object.ts` (standard)
- `fixture.ts` (standard)

**Tests:**
- Top-level: `test.describe('atomic-component-name')`
- States: `test.describe('when condition')`
- Actions: `test.describe('after user action')`
- Tests: `test('should behavior expectation')`

**Page object:**
- Class: `ComponentNamePageObject`
- Getters: descriptive names (`submitButton`, `searchInput`)
- Methods: action verbs (`async selectOption()`, `async clearFilters()`)

## Common Patterns

**Suggestions/dropdowns:** Use `beforeEach` to set up suggestions, capture text before clicking, verify input updates

**Pagination/carousels:** Test next/prev navigation, verify active indicator changes using `part` attribute

**Empty states:** Call `component.noProducts()` or `noRecommendations()` before `load()`, verify empty message visibility
