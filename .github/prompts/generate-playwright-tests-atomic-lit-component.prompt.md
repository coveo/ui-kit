---
mode: 'agent'
description: 'Generate minimal, happy path-focused E2E tests for Atomic components following established patterns'
---

# Generate E2E Tests for Atomic Components

You are a senior web developer with expertise in end-to-end testing using Playwright, Atomic components, and the UI Kit project structure. You understand the established patterns for E2E testing in the Atomic package and the importance of maintaining minimal, cost-effective test suites that focus on accessibility compliance and core functionality. Your goal is to create comprehensive yet minimal E2E tests for existing Atomic components following the established patterns and conventions in the UI Kit project.

**Note: All commands in this guide should be run from the `packages/atomic` directory.**

## Task Overview

You will be asked to create E2E tests for a specific Atomic component. These tests should be minimal, focused on the happy path, and prioritize accessibility compliance. E2E tests are expensive in terms of network requests, execution time, and maintenance, so they should only cover essential functionality while unit tests handle edge cases and detailed logic testing.

## Key Testing Principles

- **Minimal Happy Path Only**: Test core functionality, avoid edge cases (those are covered in unit tests)
- **Accessibility First**: Always include AXE accessibility testing as a mandatory requirement - this is sufficient for accessibility compliance
- **Cost-Conscious**: E2E tests are expensive (network requests, execution time, maintenance), so keep them minimal
- **Avoid Deep Testing**: Don't go beyond basic AXE checks for accessibility - deeper testing is costly in execution time and risks throttling/flakiness
- **Consistency**: Follow established patterns from existing commerce/search/insight/ipx/recommendations components
- **Storybook Integration**: Tests should load components from Storybook stories for consistency

## Understanding E2E Test Structure

E2E tests in the Atomic package follow these conventions:

- **File structure**: Each component has an `e2e/` directory with three files
- **Page Object Pattern**: Clean separation of element selectors and test logic
- **Fixture-Based Setup**: Consistent test fixture pattern with typed interfaces
- **Accessibility Testing**: Mandatory AXE compliance testing only - this is sufficient and avoids costly/flaky deeper accessibility testing
- **Minimal Coverage**: Focus on visibility and basic interactions only

## File Structure Requirements

For component `atomic-[component-name]`, create these files in the component's directory:

```
e2e/
├── atomic-[component-name].e2e.ts       # Main test file
├── fixture.ts                           # Test fixture configuration  
└── page-object.ts                       # Page object with element selectors
```

## Steps to Create E2E Tests

### 1. Analyze the Component

Before creating tests, understand the component:

- **Component directory**: Determines testing approach and interface type
- **Primary functionality**: What is the main purpose of this component?
- **User interactions**: What actions can users perform?
- **Visual elements**: What should be visible to users?
- **Interface type**: Search, Commerce, Insight, IPX, or Recommendations component?

### 2. Create Required Files

Follow this exact structure for all three files:

#### File 1: `fixture.ts`

```typescript
import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {[ComponentClassName] as [ShortName]} from './page-object';

type MyFixtures = {
  [camelCaseName]: [ShortName];
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  [camelCaseName]: async ({page}, use) => {
    await use(new [ShortName](page));
  },
});
export {expect} from '@playwright/test';
```

#### File 2: `page-object.ts`

```typescript
import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class [ComponentClassName] extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-[component-name]');
  }

  // Add component-specific selectors using [part="..."] attributes
  get [elementName]() {
    return this.page.locator('[part="[part-name]"]');
  }
  
  // For elements without parts, use semantic selectors
  get [elementName]() {
    return this.page.locator('button', {hasText: '[text]'});
  }
}
```

**Important: Only include getters that are actually used in your tests. After writing your tests, review the page object and remove any unused getters to keep the code clean and maintainable.**

#### File 3: `atomic-[component-name].e2e.ts`

```typescript
import {expect, test} from './fixture';

test.describe('[ComponentName]', () => {
  test.beforeEach(async ({[camelCaseName]}) => {
    await [camelCaseName].load();
  });

  test('should be A11y compliant', async ({[camelCaseName], makeAxeBuilder}) => {
    await [camelCaseName].hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should be visible', async ({[camelCaseName]}) => {
    await expect([camelCaseName].hydrated).toBeVisible();
  });

  // Add minimal functional tests based on component type below
});
```

### 3. Implement Component-Specific Tests

Based on the component type, add minimal tests for core functionality:

#### Display Components (text, images, links)
```typescript
test('should display [expected content]', async ({[camelCaseName]}) => {
  await expect([camelCaseName].[contentElement]).toHaveText('[expected text]');
});
```

#### Interactive Components (buttons, inputs)
```typescript
test('should [perform action] when [trigger]', async ({[camelCaseName]}) => {
  await [camelCaseName].[triggerElement].click();
  await expect([camelCaseName].[resultElement]).toHaveState('[expected state]');
});
```

#### List Components (facets, products, results)
```typescript
test('should display [items]', async ({[camelCaseName]}) => {
  await expect([camelCaseName].[itemElement].first()).toBeVisible();
  expect(await [camelCaseName].[itemElement].count()).toBeGreaterThan(0);
});
```

#### Selection Components (checkboxes, radio buttons)
```typescript
test('should allow selection', async ({[camelCaseName]}) => {
  const option = [camelCaseName].[optionElement].first();
  await expect(option).not.toBeChecked();
  await option.click();
  await expect(option).toBeChecked();
});
```

#### Navigation Components (pager, load more)
```typescript
test('should navigate to next [page/set]', async ({[camelCaseName]}) => {
  await [camelCaseName].[nextButton].click();
  // Verify state change (count, page number, etc.)
  await expect([camelCaseName].[stateIndicator]).toHaveText('[new state]');
});
```

## Best Practices and Patterns

### Element Selection Strategy
- **Prefer `[part="..."]` attributes** for component-specific elements
- **Use semantic selectors** (`button`, `input`, etc.) with text or role filters  
- **Avoid CSS classes or complex selectors** - they're brittle and maintenance-heavy

### Page Object Maintenance
- **Only include used getters** - After implementing tests, remove any unused getters from the page object
- **Keep selectors minimal** - Don't add getters "just in case" - add them when actually needed
- **Review and clean up** - Page objects should contain only the selectors that are used in the E2E tests

### Test Organization
- **Group related tests** in `describe` blocks when component has multiple features
- **Use descriptive test names** that explain the behavior being tested
- **Keep setup in `beforeEach`** for consistency across tests

### Storybook Integration
```typescript
// Load specific story variant
await [camelCaseName].load({story: 'with-custom-config'});

// Load with custom args
await [camelCaseName].load({
  args: {propertyName: 'value'}, 
  story: 'default'
});
```

### Wait Strategies
```typescript
// Wait for hydration before accessibility tests
await [camelCaseName].hydrated.waitFor();

// Wait for dynamic content
await expect([camelCaseName].[element]).toBeVisible();

// Wait for state changes
await [camelCaseName].[element].waitFor({state: 'visible'});
```

## Real-World Examples

### Simple Display Component
```typescript
test('should display component text', async ({commerceText}) => {
  await expect(commerceText.getText).toHaveText('Expected Text');
});
```

### Interactive Component
```typescript
test('should load more products when clicked', async ({loadMore}) => {
  // Get initial count pattern instead of hardcoded values
  const initialText = await loadMore.showingResults.textContent();
  const initialMatch = initialText?.match(/Showing (\d+) of (\d+)/);
  expect(initialMatch).toBeTruthy();
  
  await loadMore.button.click();
  
  // Verify the count increased, not specific numbers
  const updatedText = await loadMore.showingResults.textContent();
  const updatedMatch = updatedText?.match(/Showing (\d+) of (\d+)/);
  expect(updatedMatch).toBeTruthy();
  expect(Number(updatedMatch![1])).toBeGreaterThan(Number(initialMatch![1]));
});
```

### Selection Component
```typescript
test('should allow selecting and deselecting options', async ({numericFacet}) => {
  const option = numericFacet.getFacetValueByPosition(0);
  const checkbox = numericFacet.getFacetValueButtonByPosition(0);
  
  await expect(checkbox).not.toBeChecked();
  await option.click();
  await expect(checkbox).toBeChecked();
  
  await option.click();
  await expect(checkbox).not.toBeChecked();
});
```

## Implementation Guidelines

When asked to create E2E tests for an atomic component:

1. **Analyze the component** to understand its primary function and interface type (commerce/search/insight/ipx/recommendations)
2. **Create the three required files** using the templates above with proper naming conventions
3. **Implement minimal tests** covering:
   - Accessibility compliance (mandatory AXE test only - sufficient for compliance)
   - Visibility/basic rendering
   - Core functionality (1-3 key interactions maximum)
4. **Use existing patterns** from similar components as reference
5. **Test only happy path** scenarios - edge cases belong in unit tests
6. **Focus on user-facing behavior** rather than implementation details
7. **Avoid deep accessibility testing** - AXE check is sufficient, deeper testing is costly and risks flakiness
8. **Clean up page objects** - After implementing tests, remove any unused getters from the page object to keep it minimal and maintainable

## File Naming Conventions

- Component: `atomic-commerce-product-price`
- Fixture variable: `productPrice` (camelCase)
- Page Object Class: `AtomicCommerceProductPrice` (PascalCase)  
- Files: `atomic-commerce-product-price.e2e.ts`, `fixture.ts`, `page-object.ts`
