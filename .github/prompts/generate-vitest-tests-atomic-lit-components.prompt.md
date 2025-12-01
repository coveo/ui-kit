---
agent: 'agent'
description: 'Generate Vitest test suites for a Lit component in the Atomic package'
---

# Generate Vitest Tests for an Atomic Lit Component

Generate comprehensive unit tests for an Atomic Lit component using established patterns from `../instructions/tests-atomic.instructions.md`.

**All commands run from `packages/atomic` directory.**

## Prerequisites

Read `../instructions/tests-atomic.instructions.md` before starting.

**Component structure knowledge:**
- Molecules - Integrate with Headless controllers (search-box, facets, pager)
- Result/Product templates - Get data from parent context (`atomic-result`, `atomic-product`)
- Atoms - Basic UI elements (buttons, icons)
- Enzymes - Complex business logic components

## Result Template Component Detection

**Result template components** (e.g., `atomic-result-*`, `atomic-field-*`, commerce `atomic-product-*`) don't integrate with Headless controllers directly. They:
- Get data from parent context via `createResultContextController` or `createItemContextController`
- May use `ResultTemplatesHelpers.getResultProperty` for field access
- Live in `result-template-components/` or `product-template-components/` directories

**Fixtures available:**
- Search: `renderInAtomicResult` from `atomic-result-fixture.ts`
- Commerce: `renderInAtomicProduct` from `atomic-product-fixture.ts`

**Example usage:** See `atomic-product-price.spec.ts` (commerce) or `atomic-result-number.spec.ts` (search)

**Continue with this prompt if component is a molecule, enzyme, or result/product template component.**

## Analysis Phase

Before writing tests:

1. **Identify component category and find reference tests:**
   - **Molecules/enzymes:** Find equivalent in other use cases (search/commerce/insight/recommendations)
     - Extract base name: `atomic-[use-case-]component-name` → `component-name`
     - Search: `atomic-*{base-name}*.spec.ts` in other use case folders
     - Verify Lit tests: imports from `.ts` (not `.tsx`), uses `renderInAtomic*Interface`
   - **Result/product templates:** Find similar template component tests
     - Check `atomic-product-price.spec.ts`, `atomic-result-number.spec.ts`
   - **Analyze reference test for:** render helper structure, locator patterns, mocking strategy, test organization
   - **If no similar tests found:** Ask user if they know of one to reference
2. **Verify test fixtures exist:**
   - **Molecules/enzymes:** Check `vitest-utils/testing-helpers/fixtures/headless/{interface}/` for `buildFake{ControllerName}`. If missing, create following pattern from similar fixture (e.g., `summary-controller.ts`):
     ```typescript
     export const defaultState = {...} satisfies ControllerState;
     export const defaultImplementation = {
       subscribe: genericSubscribe,
       state: defaultState,
     } satisfies Controller;
     export const buildFakeController = ({implementation, state} = {}) => ({
       ...defaultImplementation,
       ...implementation,
       ...({state: {...defaultState, ...(state || {})}}),
     });
     ```
   - **Result/product templates:** Ensure `atomic-result-fixture.ts` or `atomic-product-fixture.ts` exists (already available)
3. Read component implementation
4. Identify public API: properties, methods, events
5. Note dependencies:
   - **Molecules/enzymes:** Headless controller dependencies
   - **Result/product templates:** Result/product fields accessed, custom events
6. Check for i18n or custom styling requirements
8. **Identify console logging scenarios:**
   - `@bindStateToController` decorator (logs errors on missing initialize/controller)
   - Parent element requirements (logs errors when rendered outside required parent)
   - Prop validation with console warnings
   - Deprecated prop usage

## Test File Patterns

### Molecule/Enzyme Pattern

Reference: `packages/atomic/scripts/generate-component-templates/component.spec.ts.hbs`

```typescript
import {buildController, type ControllerState} from '@coveo/headless';
import {page} from 'vitest/browser';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeController} from '@/vitest-utils/testing-helpers/fixtures/headless/search/controller';
import type {AtomicComponent} from './atomic-component';
import './atomic-component';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-component', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedController: ReturnType<typeof buildController>;

  const renderComponent = async ({
    props = {},
    slottedContent,
    controllerState = {},
  }: {
    props?: Partial<{someProp: string}>;
    slottedContent?: TemplateResult;
    controllerState?: Partial<ControllerState>;
  } = {}) => {
    mockedController = buildFakeController({state: controllerState});
    vi.mocked(buildController).mockImplementation(() => mockedController);

    const {element} = await renderInAtomicSearchInterface<AtomicComponent>({
      template: html`<atomic-component
        some-prop=${ifDefined(props.someProp)}
      >${ifDefined(slottedContent)}</atomic-component>`,
      selector: 'atomic-component',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
      button: page.getByRole('button'),
      parts: (el: AtomicComponent) => ({
        container: el.shadowRoot?.querySelector('[part="container"]'),
      }),
    };
  };

  describe('#initialize', () => {
    it('should not set error with valid props', async () => {
      const {element} = await renderComponent({props: {someProp: 'value'}});
      expect(element.error).toBeUndefined();
    });

    it('should set error with invalid props', async () => {
      const {element} = await renderComponent({props: {someProp: ''}});
      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toContain('someProp: value is an empty string');
    });

    it('should build controller with engine', async () => {
      const {element} = await renderComponent();
      expect(buildController).toHaveBeenCalledWith(mockedEngine);
      expect(element.controller).toBe(mockedController);
    });

    it('should bind state to controller', async () => {
      const {element} = await renderComponent({
        controllerState: {someValue: 'test'},
      });
      expect(element.controllerState.someValue).toBe('test');
    });
  });

  // Additional test groups...
});
```

### Result/Product Template Pattern

For result/product template components, use context fixtures:

**✅ DO:**
```typescript
import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import type {AtomicResultNumber} from './atomic-result-number';
import './atomic-result-number';

vi.mock('@coveo/headless', async () => {
  const actual = await vi.importActual<typeof import('@coveo/headless')>('@coveo/headless');
  return {
    ...actual,
    ResultTemplatesHelpers: {
      getResultProperty: vi.fn(),
    },
  };
});

describe('atomic-result-number', () => {
  const mockedEngine = buildFakeSearchEngine();
  const mockResult: Partial<Result> = {
    raw: {size: 1024} as Result['raw'],
  };

  const renderComponent = async ({
    props = {},
    result = mockResult,
  }: {
    props?: Partial<{field: string}>;
    result?: Partial<Result>;
  } = {}) => {
    const {element} = await renderInAtomicResult<AtomicResultNumber>({
      template: html`<atomic-result-number field=${ifDefined(props.field)}></atomic-result-number>`,
      selector: 'atomic-result-number',
      result: result as Result,
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });
    return {element};
  };
  
  // Tests...
});
```

**Note:** Commerce components use `renderInAtomicProduct` with `product` prop instead of `result`.

**Key patterns from actual codebase:**
- Return `{element, locators, parts}` from render function for clean test access
- Use `page.getByRole()` for semantic locators
- Define `parts()` function for shadow DOM queries
- Mock headless controllers with `vi.mock('@coveo/headless', {spy: true})`
- Mock `ResultTemplatesHelpers` with partial import for result/product templates
- Use `ifDefined()` for optional props/content

## Critical Patterns

**✅ DO:**
```typescript
// Use mockImplementation for mocked functions
vi.mocked(buildController).mockImplementation(() => mockedController);

// Render with desired state
const {element, button} = await renderComponent({
  props: {value: 'test'},
  controllerState: {isActive: true}
});

// Use semantic locators from page object
await userEvent.click(button);
await expect.element(button).toBeDisabled();

// Mock console in nested describe blocks that test error conditions
describe('when component encounters an error', () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should log error to console', async () => {
    const {element} = await renderComponent({/* error-triggering config */});
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('expected error message')
    );
  });
});

// Test parts when conditionally rendered
it('should render button when enabled', async () => {
  const {parts} = await renderComponent({enabled: true});
  await expect.element(parts.button).toBeInTheDocument();
});

// Test components that self-remove on error/null
const {atomicResult} = await renderComponent({props: {field: 'nonexistent'}});
const element = atomicResult.querySelector('atomic-result-number');
expect(element).toBeNull(); // Component removed itself
```

**❌ DON'T:**
```typescript
// Don't use mockReturnValue - use mockImplementation instead
vi.mocked(buildController).mockReturnValue(mockedController);

// Don't modify props after render unless testing reactivity
element.property = 'value';
await element.updateComplete;

// Don't use test() - use it()
test('should work', () => {});

// Don't mock console at top level - this hides unexpected errors in other tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Don't test all parts together when rendering logic differs
it('should render all parts', async () => {
  // When some parts are conditional, split into separate tests
});

// Don't manually create controller mocks - use buildFake* helpers
const mockController = {state: {}, subscribe: vi.fn()};

// Don't test error properties on components that self-remove
const {element} = await renderComponent({/* triggers removal */});
expect(element.error).toBe(...); // Element is null, can't access properties
```

## Test Coverage Checklist

**Pattern Analysis:**
- [ ] Found and analyzed reference component's test file (similar component in other use case or equivalent template component)

**Properties:**
- [ ] Valid props → no error
- [ ] Invalid props → error with specific message

**Controller Integration (Molecules/Enzymes):**
- [ ] Controller built with engine
- [ ] State bound via `@bindStateToController`
- [ ] Methods called on user interaction

**Result/Product Template Components:**
- [ ] Mock `ResultTemplatesHelpers.getResultProperty` for field access
- [ ] Test with valid result/product data
- [ ] Test field value parsing (if applicable)
- [ ] Test self-removal behavior for null/invalid values (if applicable)
- [ ] Test custom event handling (if component dispatches/listens)

**Rendering:**
- [ ] Shadow parts present/conditional
- [ ] Slotted content
- [ ] Event handlers
- [ ] Error state variations (if component handles errors)

**Lifecycle:**
- [ ] Event listener cleanup (if component adds listeners)
