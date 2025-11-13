---
mode: 'agent'
description: 'Generate comprehensive Vitest unit tests for an Atomic Lit functional component following established patterns'
---

# Add Vitest Tests to Atomic Lit Functional Component

Generate comprehensive Vitest unit tests for functional components (functions returning Lit `TemplateResult`, not classes). These are named `render[ComponentName]` (e.g., `renderButton`, `renderSortOption`), accept props, and are located in `src/components/common/` or similar.

**Working directory:** `packages/atomic`
**If component name not provided, ask for it.**

## Required Steps

**Use `manage_todo_list` tool:** Track progress through steps below. Mark ONE in-progress before working, mark completed immediately after finishing each step. Final todo must be execution summary generation.

**Checklist:**
- [ ] Analyze component (signature, props, children, events, dependencies)
- [ ] Create test file `{component-name}.spec.ts` in component directory
- [ ] Structure tests with describe blocks and helpers
- [ ] Implement test patterns (basic rendering, props, events, children)
- [ ] Ensure essential coverage (rendering, props, interactions, attributes, children, errors)
- [ ] Run tests with Vitest
- [ ] Generate execution summary (mandatory final todo)

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

Test: (1) Basic rendering, (2) All props/defaults, (3) User interactions, (4) Visual attributes (classes, ARIA), (5) Children if applicable, (6) Error conditions.

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

## Post-Execution Summary

**Mandatory final todo:** Generate `.github/prompts/.executions/generate-vitest-test-atomic-lit-functional-component-[YYYY-MM-DD-HHmmss].prompt-execution.md` following `TEMPLATE.prompt-execution.md`.

**Include:** Reference components used, type selection issues, ambiguous instructions, time-consuming operations, missing guidance, concrete improvement suggestions.

**Inform user** of summary location and suggest "Prompt Engineer" agent for optimization. Mark complete only after file created and user informed.