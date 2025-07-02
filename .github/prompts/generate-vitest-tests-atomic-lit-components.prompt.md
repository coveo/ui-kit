---
mode: 'agent'
description: 'Generate comprehensive Vitest test suites for Lit components in the Atomic package'
---

# Generate Vitest Tests for Atomic Lit Components

You are a senior web developer with expertise in the Atomic Lit framework and Vitest testing library. You understand the structure and conventions of the UI Kit project, particularly how to write unit tests for Lit components. Your goal is to create comprehensive Vitest unit tests for an existing Atomic Lit component following the established patterns and conventions in the UI Kit project.

**Note: All commands in this guide should be run from the `packages/atomic` directory.**

## Task Overview

You will be asked to add unit tests for a specific Atomic Lit component. Follow the guidelines from the [atomic testing instructions](../instructions/tests-atomic.instructions.md) and create a complete test suite that covers all functionality.

## Prerequisites and Context

### Required Knowledge

- **Vitest testing framework** - Modern, fast unit testing
- **Lit web components** - Component lifecycle, properties, and rendering
- **Web Components API** - Shadow DOM, custom elements, and events
- **Atomic package architecture** - Commerce components and headless integration
- **TypeScript** - Strong typing and interface definitions

### Project Context

The Atomic package is part of a larger UI kit that provides commerce-focused web components. Components integrate with headless controllers and follow specific naming conventions and architectural patterns.

### Component Types

- **Atoms** - Basic building blocks (buttons, inputs, icons)
- **Molecules** - Composed components (search boxes, facets, pagination)
- **Enzymes** - Complex business logic components
- **Utils** - Utility functions and helper classes

## Step-by-Step Instructions

### 1. Analyze the Component

Before writing tests, understand the component:

- Read the component's TypeScript implementation
- Identify public properties, methods, and events
- Understand the component's role (atom, molecule, enzyme)
- Note any headless controller dependencies
- Check for i18n requirements or custom styling

### 2. Set Up Test File Structure

Create a `.spec.ts` file with this structure:

```typescript
// Required imports - adjust based on component needs
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFake*} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/*-controller';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {page} from '@vitest/browser/context';
import {html} from 'lit';

// Component import
import {ComponentName} from './component-name';
import './component-name';

// Mock headless at the top level
vi.mock('@coveo/headless/commerce', {spy: true});

describe('ComponentName', () => {
  // Test implementation
});
```

### 3. Create Render Functions

For **Commerce Components** (molecules/enzymes):

```typescript
const renderComponent = async (options = {}) => {
  const mockedController = vi
    .fn()
    .mockReturnValue(buildFakeController(options));
  vi.mocked(buildHeadlessFunction).mockReturnValue(
    buildFakeController({
      implementation: {
        subController: mockedController,
      },
    })
  );

  const {element} = await renderInAtomicCommerceInterface<ComponentType>({
    template: html`<component-tag .prop=${options.prop}></component-tag>`,
    selector: 'component-tag',
    bindings: (bindings) => {
      bindings.interfaceElement.type = 'product-listing';
      bindings.store.onChange = vi.fn();
      return bindings;
    },
  });

  return element;
};
```

For **Basic Components** (atoms/utils):

```typescript
const renderComponent = async (props = {}) => {
  return await fixture<ComponentType>(
    html`<component-tag .prop=${props.prop}></component-tag>`
  );
};
```

### 4. Define Page Locators

Create reusable locators for consistent element selection:

```typescript
const locators = {
  // Use semantic selectors when possible
  mainButton: page.getByRole('button'),
  submitButton: page.getByRole('button', {name: 'Submit'}),
  textInput: page.getByLabelText('Search'),
  errorMessage: page.getByText('Error occurred'),

  // Shadow DOM parts accessor
  parts: (element: ComponentType) => {
    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part="${part}"]`);
    return {
      container: qs('container'),
      button: qs('button'),
      input: qs('input'),
    };
  },
};
```

### 5. Write Test Cases

Follow this structure and naming conventions:

```typescript
describe('ComponentName', () => {
  // Basic rendering tests
  it('should render correctly', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render with default properties', async () => {
    const element = await renderComponent();
    expect(element.property).toBe('defaultValue');
  });

  // Property testing
  it('should update when property changes', async () => {
    const element = await renderComponent({property: 'newValue'});
    expect(element.property).toBe('newValue');
  });

  // Interaction testing
  it('should handle click when button is pressed', async () => {
    await renderComponent();
    await locators.mainButton.click();
    // Assert expected behavior
  });

  // Conditional rendering
  describe('when specific condition is met', () => {
    beforeEach(async () => {
      await renderComponent({condition: true});
    });

    it('should display conditional content', async () => {
      await expect.element(locators.conditionalElement).toBeVisible();
    });

    it('should hide default content', async () => {
      await expect.element(locators.defaultElement).not.toBeVisible();
    });
  });

  // Public method testing
  describe('#publicMethod', () => {
    it('should return expected result', async () => {
      const element = await renderComponent();
      const result = element.publicMethod('input');
      expect(result).toBe('expected');
    });

    it('should handle error when invalid input provided', async () => {
      const element = await renderComponent();
      expect(() => element.publicMethod('invalid')).toThrow();
    });

    describe('when method has preconditions', () => {
      beforeEach(async () => {
        await renderComponent({precondition: true});
      });

      it('should behave differently with precondition', async () => {
        const element = await renderComponent({precondition: true});
        const result = element.publicMethod('input');
        expect(result).toBe('conditionalResult');
      });
    });
  });

  // Error state testing
  it('should render error state when error occurs', async () => {
    const element = await renderComponent();
    element.error = new Error('Test error');
    await expect.element(locators.errorMessage).toBeVisible();
  });

  // Shadow DOM parts testing
  it('should render all expected parts', async () => {
    const element = await renderComponent();
    const parts = locators.parts(element);

    expect(parts.container).toBeInTheDocument();
    expect(parts.button).toBeInTheDocument();
    expect(parts.input).toBeInTheDocument();
  });
};
```

## Common Patterns and Best Practices

### Test Organization

- **Single `describe` block** per spec file with component name
- **Use `it` function** (not `test`) for individual test cases
- **Start descriptions with "should"** for consistent language
- **Nest `describe` blocks** for conditional testing scenarios
- **Use `describe('#methodName')`** for public method testing

### Mocking and Setup

- **Mock headless at top level** with `vi.mock('@coveo/headless/commerce', {spy: true})`
- **Use `beforeEach` for setup** (not `afterEach` - cleanup is automatic)
- **Mock external dependencies** that are not part of the test scope
- **Use `buildFake*` utilities** for headless controller mocking

### Assertions and Expectations

- **Use semantic assertions** - `toBeVisible()`, `toBeDisabled()`, `toHaveTextContent()`
- **Test component state** - properties, internal state, DOM structure
- **Verify interactions** - event handling, method calls, state changes
- **Check error conditions** - invalid inputs, network failures, edge cases

### Performance and Reliability

- **Use page locators** for better test reliability
- **Avoid hardcoded selectors** when semantic options exist
- **Test async operations** properly with appropriate awaits
- **Keep tests focused** - one behavior per test case

## Common Pitfalls and Corrections

### ❌ Incorrect Approaches

```typescript
// Don't use test() function
test('should work', () => {});

// Don't use afterEach for cleanup
afterEach(() => {
  // cleanup code
});

// Don't create manual mocks for headless
const mockController = {
  state: {},
  subscribe: vi.fn(),
};
```

### ✅ Correct Approaches

```typescript
// Use it() function with "should"
it('should work correctly', () => {});

// Use beforeEach for setup
beforeEach(async () => {
  await renderComponent();
});

// Use buildFake* utilities
const mockedController = buildFakeController({
  state: customState,
});
```

### Error Handling

- **Mock console.error** when testing error states to keep logs clean
- **Test both success and failure paths** for methods that can fail
- **Verify error messages** are user-friendly and helpful

### Component Integration

- **Test controller integration** for commerce components
- **Verify event dispatching** and listening
- **Test property binding** and updates

## Constraints and Limitations

### What to Focus On

- **Public API testing** - properties, methods, events
- **User interaction flows** - clicks, form submissions, navigation
- **Error states and edge cases** - invalid inputs, network failures
- **Accessibility** - proper ARIA labels, keyboard navigation

### What to Avoid Unless Requested

- **Internal implementation details** - private methods, internal state
- **Complex integration scenarios** - these belong in E2E tests
- **Performance micro-optimizations** - focus on correctness first
- **Styling details** - unless functional requirements

### Testing Scope

- **Unit tests** should test components in isolation
- **Mock external dependencies** to control test environment
- **Focus on component behavior** not implementation details
- **Test public contracts** that other components depend on

## Validation Checklist

### Structure and Organization

- [ ] Single `describe` block with component name
- [ ] All imports are correctly specified
- [ ] Headless mocking is at top level
- [ ] Render functions are reusable and configurable

### Test Coverage

- [ ] Basic rendering and property tests
- [ ] User interaction scenarios
- [ ] Error states and edge cases
- [ ] Public method testing (if applicable)
- [ ] Conditional rendering scenarios

### Code Quality

- [ ] All test descriptions start with "should"
- [ ] Tests are focused on single behaviors
- [ ] Proper use of page locators
- [ ] Consistent mocking patterns
- [ ] Clean test setup in `beforeEach`

### Compliance

- [ ] Follows Atomic package testing guidelines
- [ ] Uses established testing utilities
- [ ] Proper TypeScript typing
- [ ] Semantic assertions and expectations

## Example Commands

Run tests for a specific component:

```bash
# From packages/atomic directory
npx vitest --config vitest.config.ts ./src/components/**/*component-name*.spec.ts --run
```

Run tests in watch mode during development:

```bash
npx vitest --config vitest.config.ts ./src/components/**/*component-name*.spec.ts
```

## Important Notes

- **Always analyze the component first** - understand its purpose, dependencies, and public API
- **Follow established patterns** from existing test files in the codebase
- **Use appropriate render utilities** - `renderInAtomicCommerceInterface` for commerce components, `fixture` for basic components
- **Test user scenarios** not just technical functionality
- **Keep tests maintainable** with clear descriptions and focused assertions
- **Mock external dependencies** to ensure test isolation and reliability

The goal is to create comprehensive, maintainable test suites that verify component behavior, catch regressions, and serve as living documentation of component functionality.
