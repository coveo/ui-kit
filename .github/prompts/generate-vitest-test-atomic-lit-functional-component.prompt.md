---
mode: 'agent'
description: 'Generate comprehensive Vitest unit tests to Atomic Lit functional components following established patterns'
---

# Add Vitest Tests to Atomic Lit Functional Components

You are a senior web developer with expertise in the Atomic Lit framework and Vitest testing library. You understand the structure and conventions of the UI Kit project, particularly how to write unit tests for functional components that return Lit templates. Your goal is to create comprehensive Vitest unit tests for an existing Atomic Lit functional component following the established patterns and conventions in the UI Kit project.

**Note: All commands in this guide should be run from the `packages/atomic` directory.**

## Task Overview

You will be asked to add unit tests for a specific Atomic Lit functional component. These are typically rendering functions that return Lit templates (e.g., `renderButton`, `renderCheckbox`, `renderSortOption`) rather than full Web Components. Follow the guidelines from the [atomic testing instructions](../instructions/tests-atomic.instructions.md) and create a complete test suite that covers all functionality.

## Understanding Functional Components

Functional components in the Atomic package are:

- Functions that return Lit `TemplateResult` (not classes extending `LitElement`)
- Named with the pattern `render[ComponentName]` (e.g., `renderButton`, `renderSortOption`)
- Take props as input and return rendered HTML
- Used as building blocks within larger Web Components
- Located in `src/components/common/` or similar directories

## Steps to Create Tests

Ask for the component name if not provided, then follow these steps:

### 1. Analyze the Functional Component

First, examine the component file to understand:

- **Function signature**: What props does it accept?
- **Return type**: What does it render (buttons, inputs, containers, etc.)?
- **Props interface**: What are the required vs optional properties?
- **Children handling**: Does it accept and render child content?
- **Event handlers**: What user interactions does it support?
- **Conditional rendering**: What logic affects what gets rendered?
- **Dependencies**: Does it use i18n, icons, other render functions?

### 2. Create Test File Structure

Create a test file named `{component-name}.spec.ts` in the same directory as the component.

### 3. Set Up Required Imports

For functional components, you'll typically need:

```typescript
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {page} from 'vitest/browser';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {describe, it, vi, expect, beforeEach, beforeAll} from 'vitest';
import {render[ComponentName], [ComponentName]Props} from './component-name';

// Mock external dependencies if needed
vi.mock('@/src/utils/module', () => ({
  utilFunction: vi.fn(),
}));
```

### 4. Create Test Suite Structure

Follow this naming pattern:

- Main describe: `#render[ComponentName]` (e.g., `'#renderButton'`, `'#renderSortOption'`)
- Condition describes: `'when [condition]'` (e.g., `'when disabled is true'`)
- Test cases: Always start with "should" (e.g., `'should render with correct attributes'`)

### 5. Implement Test Patterns Based on Component Type

#### A. Simple Functional Components (Buttons, Text, Icons)

```typescript
describe('#renderComponentName', () => {
  const renderComponent = async (props: Partial<ComponentProps> = {}) => {
    const defaultProps: ComponentProps = {
      // Set required props
      text: 'Default Text',
      onClick: vi.fn(),
      // Add other required props
    };

    const mergedProps = {...defaultProps, ...props};
    return await renderFunctionFixture(
      html`${renderComponentName({props: mergedProps})}`
    );
  };

  it('should render with default props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render with correct attributes', async () => {
    const element = await renderComponent({
      text: 'Test Text',
      disabled: true,
    });

    const button = element.querySelector('button');
    expect(button).toHaveTextContent('Test Text');
    expect(button).toHaveAttribute('disabled');
  });
});
```

#### B. Components with Children (Containers, Wrappers)

```typescript
describe('#renderComponentName', () => {
  const renderComponent = async (
    props: Partial<ComponentProps> = {},
    children = html`<span>Test Children</span>`
  ) => {
    const defaultProps: ComponentProps = {
      // Set required props
    };

    const mergedProps = {...defaultProps, ...props};
    return await renderFunctionFixture(
      html`${renderComponentName({props: mergedProps})(children)}`
    );
  };

  it('should render children correctly', async () => {
    const element = await renderComponent(
      {},
      html`<div class="test-child">Child Content</div>`
    );

    const child = element.querySelector('.test-child');
    expect(child).toHaveTextContent('Child Content');
  });
});
```

#### C. Components with i18n Support

```typescript
describe('#renderComponentName', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (props: Partial<ComponentProps> = {}) => {
    const defaultProps: ComponentProps = {
      i18n,
      // Other required props
    };

    const mergedProps = {...defaultProps, ...props};
    return await renderFunctionFixture(
      html`${renderComponentName({props: mergedProps})}`
    );
  };

  it('should render with correct i18n text', async () => {
    const element = await renderComponent();
    // Test i18n functionality
  });
});
```

#### D. Components with Page Locators (Interactive Elements)

```typescript
describe('#renderComponentName', () => {
  const locators = {
    get button() {
      return page.getByRole('button');
    },
    get input() {
      return page.getByRole('textbox');
    },
    option({selected}: {selected: boolean} = {selected: false}) {
      return page.getByRole('option', {selected});
    },
  };

  const renderComponent = async (props: Partial<ComponentProps> = {}) => {
    // Setup implementation
  };

  it('should handle user interaction when clicked', async () => {
    await renderComponent({onClick: vi.fn()});

    await locators.button.click();

    // Test expectations
  });
});
```

### 6. Implement Essential Test Cases

Create tests for:

1. **Basic Rendering**

   - Component renders without errors
   - Default props work correctly
   - Required props are handled

2. **Props Validation**

   - All public properties work as expected
   - Conditional rendering based on props
   - Default values are applied

3. **User Interactions**

   - Click handlers work
   - Form inputs respond correctly
   - Keyboard interactions (if applicable)

4. **Visual Attributes**

   - CSS classes are applied correctly
   - Part attributes are set
   - ARIA attributes are present

5. **Children Handling** (if applicable)

   - Children are rendered in correct location
   - Multiple children work
   - Empty children cases

6. **Error Conditions**
   - Missing required props
   - Invalid prop values
   - Edge cases

### 7. Common Test Patterns and Examples

#### Testing Attribute Rendering

```typescript
it('should apply correct CSS classes when style prop is provided', async () => {
  const element = await renderComponent({
    style: 'primary',
    additionalClass: 'custom-class',
  });

  const button = element.querySelector('button');
  expect(button).toHaveClass('btn-primary', 'custom-class');
});

it('should set part attribute correctly', async () => {
  const element = await renderComponent({part: 'custom-part'});

  const button = element.querySelector('button');
  expect(button).toHaveAttribute('part', 'custom-part');
});
```

#### Testing Event Handlers

```typescript
it('should call onClick when button is clicked', async () => {
  const handleClick = vi.fn();
  await renderComponent({onClick: handleClick});

  const button = page.getByRole('button');
  await button.click();

  expect(handleClick).toHaveBeenCalledTimes(1);
});

it('should pass correct arguments to event handler', async () => {
  const handleClick = vi.fn();
  await renderComponent({
    onClick: handleClick,
    value: 'test-value',
  });

  const button = page.getByRole('button');
  await button.click();

  expect(handleClick).toHaveBeenCalledWith('test-value');
});
```

#### Testing Conditional Rendering

```typescript
describe('when disabled is true', () => {
  it('should render disabled button', async () => {
    const element = await renderComponent({disabled: true});

    const button = element.querySelector('button');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    await renderComponent({
      disabled: true,
      onClick: handleClick,
    });

    const button = page.getByRole('button');
    await button.click();

    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

#### Testing i18n Integration

```typescript
it('should render localized text correctly', async () => {
  const customI18n = await createTestI18n();
  customI18n.addResourceBundle('en', 'translation', {
    'button.label': 'Custom Button Label',
  });

  const element = await renderComponent({
    i18n: customI18n,
    labelKey: 'button.label',
  });

  const button = element.querySelector('button');
  expect(button).toHaveTextContent('Custom Button Label');
});

it('should fall back to key when translation missing', async () => {
  const element = await renderComponent({
    labelKey: 'missing.key',
  });

  const button = element.querySelector('button');
  expect(button).toHaveTextContent('missing.key');
});
```

#### Testing Children Rendering

```typescript
it('should render single child correctly', async () => {
  const element = await renderComponent(
    {},
    html`<span class="child">Single Child</span>`
  );

  const child = element.querySelector('.child');
  expect(child).toHaveTextContent('Single Child');
});

it('should render multiple children correctly', async () => {
  const element = await renderComponent(
    {},
    html`
      <div class="child-1">Child 1</div>
      <div class="child-2">Child 2</div>
    `
  );

  expect(element.querySelector('.child-1')).toHaveTextContent('Child 1');
  expect(element.querySelector('.child-2')).toHaveTextContent('Child 2');
});

it('should handle empty children', async () => {
  const element = await renderComponent({}, html``);

  // Test that component still renders correctly with no children
  expect(element.querySelector('[part="container"]')).toBeInTheDocument();
});
```

### 8. Run Tests to Verify

```bash
npx vitest --config vitest.config.ts ./src/components/path/component.spec.ts --run
```

## Testing Utilities for Functional Components

### Main Utilities

- **`renderFunctionFixture(template)`** - Primary utility for rendering functional components
- **`createTestI18n()`** - Creates test i18n instance
- **`page` locators** - Use for interactive element selection
- **`vi.fn()`** - For mocking functions and event handlers

### Required Setup Pattern

```typescript
// 1. Import the render function and props interface
import {renderComponentName, ComponentNameProps} from './component-name';

// 2. Create a reusable render helper
const renderComponent = async (props: Partial<ComponentNameProps> = {}) => {
  const defaultProps: ComponentNameProps = {
    // Set all required props with sensible defaults
  };

  const mergedProps = {...defaultProps, ...props};
  return await renderFunctionFixture(
    html`${renderComponentName({props: mergedProps})}`
  );
};

// 3. For components with children
const renderComponentWithChildren = async (
  props: Partial<ComponentNameProps> = {},
  children = html`<span>Default Children</span>`
) => {
  const mergedProps = {...defaultProps, ...props};
  return await renderFunctionFixture(
    html`${renderComponentName({props: mergedProps})(children)}`
  );
};
```

## Important Guidelines

### Mock Management

⚠️ **Mock external dependencies at the top level**:

```typescript
// ✅ Correct
vi.mock('@/src/utils/module', () => ({
  utilFunction: vi.fn(),
}));

import {renderComponentName} from './component-name';

// ❌ Incorrect - mocks should be before imports
import {renderComponentName} from './component-name';
vi.mock('@/src/utils/module');
```

### Test Organization

- **Function level**: Use `#render[ComponentName]` for the main describe
- **Props testing**: Group related prop tests together
- **Interaction testing**: Group user interaction tests
- **Conditional rendering**: Use `'when [condition]'` describes

### Naming Conventions

- **Main describe**: `#render[ComponentName]` (e.g., `#renderButton`)
- **Condition describes**: `when [condition]` (e.g., `when disabled is true`)
- **Test cases**: Always start with "should" (e.g., `should render correctly`)

### Common Patterns to Test

1. **Default rendering** - Component renders with minimal props
2. **Prop variations** - Each prop affects rendering correctly
3. **Edge cases** - Empty values, null/undefined props
4. **User interactions** - All event handlers work
5. **Accessibility** - ARIA attributes, keyboard navigation
6. **Visual attributes** - CSS classes, part attributes
7. **Children handling** - If component accepts children

## Completion Checklist

After creating the test file:

- [ ] All imports are correctly set up
- [ ] Component render function works with default props
- [ ] All public props are tested
- [ ] Event handlers are tested (if applicable)
- [ ] Children rendering is tested (if applicable)
- [ ] Conditional rendering scenarios are covered
- [ ] Edge cases and error conditions are tested
- [ ] Tests follow naming conventions
- [ ] Tests run successfully without errors
- [ ] No console warnings or errors during test execution

## Common Functional Component Examples

### Button Component Test Structure

```typescript
describe('#renderButton', () => {
  const renderButton = (props: Partial<ButtonProps> = {}) => {
    return renderFunctionFixture(
      html`${renderButton({
        props: {
          style: 'primary',
          ...props,
        },
      })(html`Button Text`)}`
    );
  };

  it('should render button with correct style class', async () => {
    const element = await renderButton({style: 'secondary'});
    const button = element.querySelector('button');
    expect(button).toHaveClass('btn-secondary');
  });
});
```

### Option Component Test Structure

```typescript
describe('#renderSortOption', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const locators = {
    option({selected}: {selected: boolean} = {selected: false}) {
      return page.getByRole('option', {selected});
    },
  };

  const setupElement = async (props: Partial<SortOptionProps>) => {
    return await renderFunctionFixture(
      html`${renderSortOption({
        props: {
          i18n,
          value: 'default-value',
          selected: false,
          label: 'default-label',
          ...props,
        },
      })}`
    );
  };
});
```

Ask me for the functional component name if not provided, then proceed to analyze the component and create comprehensive tests following these patterns.
