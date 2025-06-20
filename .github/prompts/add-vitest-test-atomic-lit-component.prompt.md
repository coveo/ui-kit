---
mode: 'agent'
tools: ['codebase', 'terminalLastCommand', 'testFailure', 'problems']
description: 'Add comprehensive Vitest unit tests to Atomic Lit components following established patterns'
---

# Add Vitest Tests to Atomic Lit Components

Your goal is to create comprehensive Vitest unit tests for an existing Atomic Lit component following the established patterns and conventions in the UI Kit project.

**Note: All commands in this guide should be run from the `packages/atomic` directory.**

## Task Overview

You will be asked to add unit tests for a specific Atomic Lit component. Follow the guidelines from the [atomic testing instructions](../instructions/tests-atomic.instructions.md) and create a complete test suite that covers all component functionality.

## Steps to Create Tests

Ask for the component name if not provided, then follow these steps:

### 1. Analyze the Component

First, examine the component file to understand:

- Component type (simple display, commerce component, complex interactive)
- Props and their types
- Public methods
- State management
- Dependencies on headless controllers
- Error handling requirements
- What will be rendered in Shadow DOM versus Light DOM (Tests locators should be aware of this)

### 2. Create Test File Structure

Create a test file named `{component-name}.spec.ts` in the same directory as the component.

### 3. Set Up Required Imports

```typescript
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFake[Controller]} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/[controller]';
import {build[HeadlessFunction]} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {describe, it, vi, expect, beforeEach} from 'vitest';
import {Atomic[ComponentName]} from './atomic-[component-name]';

// Mock headless at the top level
vi.mock('@coveo/headless/commerce', {spy: true});
```

### 4. Create Test Suite Structure

Follow this naming pattern:

- Main describe: component tag name (e.g., `'atomic-commerce-text'`)
- Method describes: `#methodName` (e.g., `'#initialize'`)
- Condition describes: `'when [condition]'` (e.g., `'when value is provided'`)
- Test cases: Always start with "should" (e.g., `'should render correctly'`)

### 5. Implement Test Patterns Based on Component Type

#### A. Commerce Components (Most Common)

```typescript
describe('atomic-commerce-component', () => {
  const locators = {
    mainButton: page.getByRole('button'),
    specificElement: page.getByLabelText('Label Text'),
    // Use parts for shadow DOM elements
    parts: (element: AtomicCommerceComponent) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      return {
        mainButton: qs('main-button'),
        secondaryButton: qs('secondary-button'),
      };
    },
  };

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

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceComponent>({
        template: html`<atomic-commerce-component
          .prop=${options.prop}
        ></atomic-commerce-component>`,
        selector: 'atomic-commerce-component',
        bindings: (bindings) => {
          bindings.interfaceElement.type = 'product-listing';
          bindings.store.onChange = vi.fn();
          return bindings;
        },
      });

    return element;
  };

  // Test cases here
});
```

#### B. Simple Components (Text, Display-only)

```typescript
describe('atomic-simple-component', () => {
  const renderComponent = async (props = {}) => {
    const {element} =
      await renderInAtomicCommerceInterface<AtomicSimpleComponent>({
        template: html`<atomic-simple-component
          .value=${props.value}
          .count=${props.count}
        ></atomic-simple-component>`,
        selector: 'atomic-simple-component',
        bindings: (bindings) => {
          bindings.interfaceElement.type = 'product-listing';
          return bindings;
        },
      });

    return element;
  };

  // Test cases here
});
```

### 6. Implement Essential Test Cases

Create tests for:

1. **Basic rendering** - Component creates and renders correctly
2. **Prop validation** - All public properties work as expected
3. **User interactions** - Click handlers, form inputs, etc.
4. **State management** - Internal state changes
5. **Error conditions** - Missing required props, invalid inputs
6. **Public methods** - All exported functions work correctly

### 7. Run Tests to Verify

```bash
npx vitest --config vitest.config.ts ./src/components/path/component.spec.ts --run
```

## Test Implementation Examples

### Basic Test Structure

```typescript
it('should render with default props', async () => {
  const element = await renderComponent();
  expect(element).toBeDefined();
});

it('should handle prop changes when prop is updated', async () => {
  const element = await renderComponent({prop: 'value'});
  // Test implementation
});

describe('when specific condition occurs', () => {
  beforeEach(async () => {
    await renderComponent({specificState: true});
  });

  it('should behave correctly', async () => {
    // Test implementation
  });
});
```

### Error Handling Tests

```typescript
it('should throw error when required prop is missing', async () => {
  const element = await renderComponent();
  expect(element.error).toBeDefined();
  expect(element.error.message).toContain('must be defined');
});
```

### User Interaction Tests

```typescript
it('should handle click when button is pressed', async () => {
  await renderComponent();
  const button = locators.button;

  await button.click();

  // Verify the result
  await expect.element(page.getByText('Expected Result')).toBeVisible();
});
```

### Public Method Tests

```typescript
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
});
```

## Important Guidelines

### Mock Setup Order

⚠️ **Always mock headless before importing component**:

```typescript
// ✅ Correct
vi.mock('@coveo/headless/commerce', {spy: true});
import {AtomicComponent} from './atomic-component';

// ❌ Incorrect
import {AtomicComponent} from './atomic-component';
vi.mock('@coveo/headless/commerce', {spy: true});
```

### Test Naming

- **Component level**: Use component tag name (`'atomic-commerce-text'`)
- **Method level**: Use `#methodName` (`'#initialize'`)
- **Condition level**: Use `'when [condition]'` (`'when value is provided'`)
- **Test cases**: Always start with "should" (`'should render correctly'`)

### Use beforeEach for Setup

```typescript
// ✅ Correct: Use beforeEach for setup
describe('when condition occurs', () => {
  beforeEach(async () => {
    await renderComponent({specificState: true});
  });

  it('should behave correctly', async () => {
    // Test implementation
  });
});
```

## Completion Checklist

After creating the test file:

- [ ] All imports are correctly set up
- [ ] Headless mocking is configured properly
- [ ] Component render function works
- [ ] Basic rendering test passes
- [ ] All public props are tested
- [ ] All public methods are tested
- [ ] Error conditions are tested
- [ ] User interactions are tested (if applicable)
- [ ] Tests follow naming conventions
- [ ] Tests run successfully without errors

Ask me for the component name if not provided, then proceed to analyze the component and create comprehensive tests following these patterns.
