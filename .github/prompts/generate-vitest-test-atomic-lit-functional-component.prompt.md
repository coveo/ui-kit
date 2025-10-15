---
mode: 'agent'
description: 'Generate comprehensive Vitest unit tests for an Atomic Lit functional component following established patterns'
---

# Add Vitest Tests to Atomic Lit Functional Component

Generate comprehensive Vitest unit tests for a functional component that returns a Lit template (e.g., `renderButton`, `renderSortOption`). Follow the [Atomic testing instructions](../instructions/tests-atomic.instructions.md) and established codebase patterns.

**Working directory:** `packages/atomic`

## What Are Functional Components?

Functions that return Lit `TemplateResult` (not classes):
- Named `render[ComponentName]` (e.g., `renderButton`, `renderSortOption`)
- Accept props, return rendered HTML
- Used as building blocks in Web Components
- Located in `src/components/common/` or similar

## Required Steps

**If component name not provided, ask for it.** Then:

### 1. Analyze the Component

Examine the component file for:
- **Function signature** - Props interface and types
- **Return type** - What it renders (buttons, inputs, containers)
- **Children handling** - Does it accept child content?
- **Event handlers** - What interactions does it support?
- **Conditional rendering** - Logic affecting output
- **Dependencies** - i18n, icons, other render functions

### 2. Create Test File

File: `{component-name}.spec.ts` in same directory as component.

### 3. Set Up Imports

```typescript
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {describe, it, vi, expect, beforeAll} from 'vitest';
import {render[ComponentName], type [ComponentName]Props} from './component-name';

// Mock dependencies if needed
vi.mock('@/src/utils/module', () => ({
  utilFunction: vi.fn(),
}));
```

### 4. Structure Tests

```typescript
describe('#render[ComponentName]', () => {
  // Tests here
});
```

Nested describes: `'when [condition]'` for conditional scenarios
Test names: Always start with "should"

### 5. Test Patterns by Component Type

#### Simple Components (Buttons, Icons)

```typescript
const renderComponent = async (props: Partial<ComponentProps> = {}) => {
  const defaultProps: ComponentProps = {
    text: 'Default',
    onClick: vi.fn(),
  };

  return await renderFunctionFixture(
    html`${renderComponentName({props: {...defaultProps, ...props}})}`
  );
};

it('should render with correct attributes', async () => {
  const element = await renderComponent({
    text: 'Test',
    disabled: true,
  });

  const button = element.querySelector('button');
  expect(button).toHaveTextContent('Test');
  expect(button).toHaveAttribute('disabled');
});
```

#### Components with Children

```typescript
const renderComponent = async (
  props: Partial<ComponentProps> = {},
  children = html`<span>Test</span>`
) => {
  return await renderFunctionFixture(
    html`${renderComponentName({props: {...defaultProps, ...props}})(children)}`
  );
};

it('should render children correctly', async () => {
  const element = await renderComponent(
    {},
    html`<div class="child">Content</div>`
  );

  expect(element.querySelector('.child')).toHaveTextContent('Content');
});
```

#### Components with i18n

```typescript
let i18n: Awaited<ReturnType<typeof createTestI18n>>;

beforeAll(async () => {
  i18n = await createTestI18n();
});

const renderComponent = async (props: Partial<ComponentProps> = {}) => {
  return await renderFunctionFixture(
    html`${renderComponentName({props: {i18n, ...defaultProps, ...props}})}`
  );
};
```

#### Interactive Components (Page Locators)

```typescript
const locators = {
  get button() {
    return page.getByRole('button');
  },
  option({selected}: {selected: boolean} = {selected: false}) {
    return page.getByRole('option', {selected});
  },
};

it('should handle click', async () => {
  const onClick = vi.fn();
  await renderComponent({onClick});

  await locators.button.click();

  expect(onClick).toHaveBeenCalledOnce();
});
```

### 6. Essential Test Cases

Cover:

1. **Basic rendering** - Component renders without errors
2. **Props** - All properties work correctly, defaults applied
3. **User interactions** - Click handlers, form inputs, keyboard
4. **Visual attributes** - CSS classes, part attributes, ARIA
5. **Children** (if applicable) - Single, multiple, empty
6. **Error conditions** - Missing required props, invalid values

5. **Children** (if applicable) - Single, multiple, empty
6. **Error conditions** - Missing required props, invalid values

### 7. Example Test Patterns

#### Attributes & Classes

```typescript
it('should apply CSS classes from props', async () => {
  const element = await renderComponent({
    style: 'primary',
    class: 'custom',
  });

  const button = element.querySelector('button');
  expect(button).toHaveClass('btn-primary', 'custom');
});
```

#### Event Handlers

```typescript
it('should call onClick with correct arguments', async () => {
  const onClick = vi.fn();
  await renderComponent({onClick, value: 'test'});

  const button = page.getByRole('button');
  await button.click();

  expect(onClick).toHaveBeenCalledWith('test');
});
```

#### Conditional Rendering

```typescript
describe('when disabled is true', () => {
  it('should render disabled button', async () => {
    const element = await renderComponent({disabled: true});

    const button = element.querySelector('button');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should not call onClick when clicked', async () => {
    const onClick = vi.fn();
    await renderComponent({disabled: true, onClick});

    await page.getByRole('button').click();

    expect(onClick).not.toHaveBeenCalled();
  });
});
```

#### i18n Integration

```typescript
it('should render localized text', async () => {
  const customI18n = await createTestI18n();
  customI18n.addResourceBundle('en', 'translation', {
    'button.label': 'Custom Label',
  });

  const element = await renderComponent({
    i18n: customI18n,
    labelKey: 'button.label',
  });

  expect(element.querySelector('button')).toHaveTextContent('Custom Label');
});
```

### 8. Run Tests

```bash
npx vitest ./src/components/path/component.spec.ts --run
```

## Key Guidelines

**Mock external dependencies at file top** (before imports that use them):
```typescript
vi.mock('@/src/utils/module', () => ({utilFunction: vi.fn()}));
```

**Use `page` locators for interactive tests:**
```typescript
const button = page.getByRole('button');
await button.click();
```

**Prefer creation with desired props over mutation:**
```typescript
// ✅ Good
const element = await renderComponent({property: 'value'});

// ❌ Avoid (unless testing reactivity)
element.property = 'value';
await element.updateComplete;
```

**Group related tests with describes:**
```typescript
describe('when disabled is true', () => {
  // All disabled-related tests
});
```

## Quick Reference

**Main utilities:**
- `renderFunctionFixture(template)` - Render functional components
- `createTestI18n()` - Test i18n instance
- `page.getByRole()` - Interactive element locators
- `vi.fn()` - Mock functions

**Naming:**
- Top describe: `'#render[ComponentName]'`
- Nested describes: `'when [condition]'`
- Tests: `'should [behavior]'`

**Common assertions:**
```typescript
expect(element).toBeDefined()
expect(button).toHaveTextContent('text')
expect(button).toHaveAttribute('disabled')
expect(button).toHaveClass('class-name')
expect(onClick).toHaveBeenCalledWith(arg)
await expect.element(locator).toBeInTheDocument()
```

Ask for the component name if not provided, then analyze and create comprehensive tests following these patterns.

## Post-Execution: Generate Summary

After completing test generation, generate execution summary:

**1. Create summary file:**
- **Location:** `.github/prompts/.executions/generate-vitest-test-atomic-lit-functional-component-[YYYY-MM-DD-HHmmss].prompt-execution.md`
- **Structure:** Follow `.github/prompts/.executions/TEMPLATE.prompt-execution.md`
- **Purpose:** Structured feedback for prompt optimization

**2. Include in summary:**
- Which similar functional component tests were used as reference (if any)
- Issues with understanding component signature or dependencies
- Ambiguities in prompt instructions that required interpretation
- Time-consuming operations (excessive file reads, searches)
- Missing instructions or unclear testing requirements
- Concrete suggestions for prompt improvements

**3. Inform user** about summary location and next steps (switch to "Prompt Engineer" chatmode for optimization)

**4. Mark complete** only after file created and user informed.

````
```

Ask for the component name if not provided, then analyze and create comprehensive tests following these patterns.
