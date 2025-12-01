---
agent: 'agent'
description: 'Generate comprehensive Vitest unit tests for an Atomic Lit functional component following established patterns'
---

# Add Vitest Tests to Atomic Lit Functional Component

Generate comprehensive Vitest unit tests for functional components (functions returning Lit `TemplateResult`, not classes). These are named `render[ComponentName]` (e.g., `renderButton`, `renderSortOption`), accept props, and are located in `src/components/common/` or similar.

**Working directory:** `packages/atomic`
**If component name not provided, ask for it.**

## Required Steps

**Track your progress systematically:** Break down test generation into these sequential tasks, work on ONE at a time, and mark each complete before proceeding.

**Checklist:**
- [ ] Analyze component (signature, props, children, events, dependencies)
- [ ] Create test file `{component-name}.spec.ts` in component directory
- [ ] Structure tests with describe blocks and helpers
- [ ] Implement test patterns (basic rendering, props, events, children)
- [ ] Ensure essential coverage (rendering, props, interactions, attributes, children, errors)
- [ ] Run tests with Vitest

### 1. Analyze the Component

Examine for:
- **Function signature** - Props interface and types
- **Return type** - What it renders
- **Children handling** - Accepts child content?
- **Event handlers** - Supported interactions
- **Conditional rendering** - Logic affecting output
- **Dependencies** - i18n, icons, other render functions

### 2. Create Test File

`{component-name}.spec.ts` in same directory as component.

### 3. Structure Tests

Use `describe('#render[ComponentName]', () => {...})` with nested describes for conditions (`'when [condition]'`). Test names start with "should".

### 4. Test Patterns

**Basic setup with helper:**
```typescript
const renderComponent = async (props: Partial<ComponentProps> = {}) => {
  const defaultProps: ComponentProps = {text: 'Default', onClick: vi.fn()};
  return await renderFunctionFixture(
    html`${renderComponentName({props: {...defaultProps, ...props}})}`
  );
};
```

**Components with children:**
```typescript
const renderComponent = async (
  props: Partial<ComponentProps> = {},
  children = html`<span>Default</span>`
) => {
  return await renderFunctionFixture(
    html`${renderComponentName({props: {...defaultProps, ...props}})(children)}`
  );
};
```

**Components with i18n:**
```typescript
let i18n: Awaited<ReturnType<typeof createTestI18n>>;
beforeAll(async () => { i18n = await createTestI18n(); });

const renderComponent = async (props: Partial<ComponentProps> = {}) => {
  return await renderFunctionFixture(
    html`${renderComponentName({props: {i18n, ...defaultProps, ...props}})}`
  );
};
```

**Interactive tests with locators:**
```typescript
const locators = {
  get button() { return page.getByRole('button'); },
  option({selected = false}) { return page.getByRole('option', {selected}); },
};

it('should handle click', async () => {
  const onClick = vi.fn();
  await renderComponent({onClick});
  await locators.button.click();
  expect(onClick).toHaveBeenCalledOnce();
});
```

### 5. Essential Coverage

Test: (1) Basic rendering, (2) All props/defaults, (3) User interactions, (4) Conditional visual attributes (CSS classes, ARIA), (5) Children if applicable, (6) Error conditions.

**Note:** Static CSS classes and attributes are covered by visual regression tests. Focus unit tests on conditional logic.

### 6. Key Patterns

**Attributes & events:**
```typescript
it('should apply classes and handle clicks', async () => {
  const onClick = vi.fn();
  const element = await renderComponent({class: 'custom', onClick});
  
  expect(element.querySelector('button')).toHaveClass('custom');
  await page.getByRole('button').click();
  expect(onClick).toHaveBeenCalledOnce();
});
```

**Conditional rendering:**
```typescript
describe('when disabled', () => {
  it('should render disabled and not call onClick', async () => {
    const onClick = vi.fn();
    const element = await renderComponent({disabled: true, onClick});
    
    expect(element.querySelector('button')).toHaveAttribute('disabled');
    await page.getByRole('button').click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

**i18n:**
```typescript
it('should render localized text', async () => {
  const customI18n = await createTestI18n();
  customI18n.addResourceBundle('en', 'translation', {'key': 'Localized'});
  
  const element = await renderComponent({i18n: customI18n, labelKey: 'key'});
  expect(element).toHaveTextContent('Localized');
});
```

**Icon properties:**
When components accept icon props (from `@/src/components/common/icon/icon`), test using bracket notation:
```typescript
it('should render with correct icon', async () => {
  const element = await renderComponent({icon: ArrowUp});
  const iconElement = element.querySelector('atomic-icon');
  expect(iconElement?.['icon']).toBe(ArrowUp);
});
```

**Children content:**
Verify children via text content. DOM structure verification is optional:
```typescript
it('should render children', async () => {
  const element = await renderComponent({}, html`<span>Child content</span>`);
  expect(element).toHaveTextContent('Child content'); // Sufficient
});
```

### 7. Run Tests

```bash
npx vitest ./src/components/path/component.spec.ts --run
```

## Guidelines

**Mock dependencies before imports:**
```typescript
vi.mock('@/src/utils/module', () => ({utilFunction: vi.fn()}));
```

**Use `page` locators for interactions:**
```typescript
await page.getByRole('button').click();
```

**Prefer creation over mutation:**
```typescript
// ✅ Good - create with desired props
const element = await renderComponent({property: 'value'});

// ❌ Avoid - unless testing reactivity
element.property = 'value';
await element.updateComplete;
```

**Group related tests:**
```typescript
describe('when disabled', () => {
  // All disabled-related tests
});
```

**Conditional CSS classes:**
Test classes that change based on props/state. Skip static classes:
```typescript
// ✅ Test conditional classes
it('should apply active class when selected', async () => {
  const element = await renderComponent({selected: true});
  expect(element.querySelector('button')).toHaveClass('bg-primary');
});

it('should not apply active class when not selected', async () => {
  const element = await renderComponent({selected: false});
  expect(element.querySelector('button')).not.toHaveClass('bg-primary');
});

// ❌ Skip static classes (covered by visual tests)
it('should have rounded corners', async () => {
  const element = await renderComponent();
  expect(element.querySelector('button')).toHaveClass('rounded-lg'); // Unnecessary
});
```

**Avoid tw/multiClassMap in test helpers:**
When creating test fixtures, use plain class strings. Reserve `tw`/`multiClassMap` for testing the component's conditional logic, not test setup:
```typescript
// ✅ Good - plain strings in tests
const element = await renderComponent({class: 'test-class'});

// ❌ Avoid - unnecessary complexity in tests
const classNames = tw({'test-class': true});
const element = await renderComponent({class: multiClassMap(classNames)});
```
