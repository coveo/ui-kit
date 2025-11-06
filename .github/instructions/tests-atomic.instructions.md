---
applyTo: '**/atomic/**/*.spec.{ts}'
---

## File Naming & Structure

**Naming:** `<module-name>.spec.ts` matching the tested file (e.g., `atomic-breadbox.spec.ts`)

**Top-level describe:**
- Components: `'atomic-element-name'`
- Functions: `'#functionName'`
- Decorators: `'@decoratorName'`
- Controllers: `'ControllerClassName'`
- Mixins: `'MixinConstName'`
- Utils: `'module-file-name'` (no extension)

**Test naming:** Use `it('should <behavior> [when <condition>]')` (never `test()`). Nest multiple related tests under `describe('when <condition>', () => {...})` or `describe('#methodName', () => {...})` for public methods.

## Imports & Mocking

**Import explicitly from Vitest:**
```typescript
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {html} from 'lit';
```

**Mock at file top** (after imports, before tests):
```typescript
vi.mock('@coveo/headless', {spy: true});
// Custom implementation:
vi.mock('@/src/utils/xss-utils', () => ({
  filterProtocol: vi.fn((url: string) => url)
}));
```

**Mock cleanup:** Automatic via `restoreMocks: true` in vitest.config.js. Never manually reset in `beforeEach` unless preserving state across tests.

**⚠️ Important: Browser Mode Spying Pattern**

When using `vi.mock(module, {spy: true})` in **browser mode** with monorepo packages, import the module as a namespace to use `mockReturnValue()`:

```typescript
// ❌ Wrong - Named imports don't work with mockReturnValue in browser mode
import {isArray} from '@coveo/bueno';
vi.mock('@coveo/bueno', {spy: true});
vi.mocked(isArray).mockReturnValue(true); // May fail in browser mode

// ✅ Correct - Namespace import allows direct method calls
import * as bueno from '@coveo/bueno';
vi.mock('@coveo/bueno', {spy: true});
bueno.isArray.mockReturnValue(true); // Works in browser mode

// ✅ Alternative - Use vi.spyOn for individual functions
import * as bueno from '@coveo/bueno';
vi.spyOn(bueno, 'isArray').mockReturnValue(true);
```

This is specific to browser mode with modules that use re-exports (`export *`). For more details, see [Vitest Browser Mode - Spying on Module Exports](https://vitest.dev/guide/browser/#spying-on-module-exports).

## Testing Components

> **Template reference:** `packages/atomic/scripts/generate-component-templates/component.spec.ts.hbs`

**Pattern:** Create `render<ComponentName>()` accepting options, returning `{element, locators, parts}`.

```typescript
const renderComponent = async ({
  props = {},
  slottedContent,
  controllerState = {},
} = {}) => {
  vi.mocked(buildController).mockReturnValue(
    buildFakeController({state: controllerState})
  );

  const {element} = await renderInAtomicSearchInterface<ComponentType>({
    template: html`<tag .prop=${props.value}>${ifDefined(slottedContent)}</tag>`,
    selector: 'tag',
    bindings: (bindings) => {
      bindings.engine = mockEngine;
      return bindings;
    },
  });

  return {
    element,
    button: page.getByRole('button'),
    parts: (el) => ({
      container: el.shadowRoot?.querySelector('[part="container"]'),
      button: el.shadowRoot?.querySelector('[part="button"]'),
    }),
  };
};
```

**Test coverage:**
- **Props:** Valid props → no error. Invalid props → error with message.
- **Controller:** `expect(buildController).toHaveBeenCalledWith(engine)`. Verify `@bindStateToController` reflects state. Test method calls on interaction.
- **Rendering:** Shadow parts present. Conditional rendering. Slots. Event handlers.
- **Lifecycle:** Event listener cleanup in `disconnectedCallback` (when component adds listeners).

**Assertions:**
```typescript
await expect.element(locator).toBeInTheDocument()
await expect.element(locator).toHaveTextContent('text')
await expect.element(locator).toBeEnabled()
expect(mockFn).toHaveBeenCalledWith(...)
```

## Testing Functional Components

Use `'#functionName'` for top-level describe. Render with `renderFunctionFixture`:

```typescript
const renderFn = async (overrides = {}) => {
  const element = await renderFunctionFixture(
    html`${myFunction({...defaults, ...overrides})}`
  );
  return {container: element.querySelector('[part="container"]')};
};
```

**i18n:** Initialize in `beforeAll`:
```typescript
let i18n: i18n;
beforeAll(async () => { i18n = await createTestI18n(); });
```

## Testing Controllers, Mixins, Decorators, Converters

- **Controllers:** Test `hostConnected/hostUpdated/hostDisconnected`. Verify `element.addController()` called.
- **Mixins:** Create test elements extending mixin. Test extended behavior. Mock dependencies.
- **Decorators:** Apply to test classes. Verify decorated behavior.
- **Converters:** Render elements with converter applied. Test attribute → property conversion with various values.

## Testing Utils

Top-level describe: `'module-name'`. Group functions: `describe('#functionName')`. Cover edge cases.

## Utilities Reference

**Fixtures:**
- `fixture<T>(template)` - Standalone Lit elements
- `renderFunctionFixture(template)` - Functional components  
- `renderInAtomicSearchInterface<T>({template, selector, bindings})` - Search context
- `renderInAtomicCommerceInterface<T>({template, selector, bindings})` - Commerce context

**Mocking:** `buildFake*()` from `vitest-utils/testing-helpers/fixtures/headless/`. Pattern: `vi.mocked(buildController).mockReturnValue(buildFakeController({...}))`

**i18n:** `createTestI18n()` - Create test instance

**Locators:** `page.getByRole()`, `page.getByText()`, `page.getByLabelText()`, `element.shadowRoot?.querySelector('[part="name"]')`

## Patterns & Pitfalls

**✅ Create with desired props:**
```typescript
const element = await renderComponent({property: 'value'});
```

**❌ Avoid modifying props post-render** (unless specifically testing prop reactivity):
```typescript
// Avoid this pattern unless testing prop updates
element.property = 'value';
await element.updateComplete;
```

**✅ Test parts conditionally when rendering logic differs:**
```typescript
// When all parts always render:
it('should render all parts', async () => {
  const {parts} = await renderComponent();
  await expect.element(parts.container).toBeInTheDocument();
  await expect.element(parts.button).toBeInTheDocument();
});

// When parts render conditionally, separate tests:
it('should render button when enabled', async () => {
  const {parts} = await renderComponent({enabled: true});
  await expect.element(parts.button).toBeInTheDocument();
});
```

**✅ Mock console in nested describe blocks for expected errors/warnings:**
```typescript
describe('when validation fails', () => {
  let consoleWarnSpy: MockInstance;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should warn about invalid prop', () => {
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});
```

**❌ Don't mock console at top level** - this hides unexpected errors in other tests.

- **Always mock headless at the top level** with `vi.mock('@coveo/headless/commerce', {spy: true})`
- **Use `beforeEach` for setup, not `afterEach`** - the framework handles cleanup automatically
- **Use page locators** from `vitest/browser` for better test reliability
- **Create reusable render functions** to avoid duplication and ensure consistent setup
- **Use `buildFake*` utilities** instead of creating manual mocks for headless controllers

## Commands

Run from `packages/atomic`:
```bash
npx vitest ./src/**/*.spec.ts --run
```