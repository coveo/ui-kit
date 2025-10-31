---
mode: 'agent'
description: 'Generate Vitest test suites for a Lit component in the Atomic package'
---

# Generate Vitest Tests for an Atomic Lit Component

Generate comprehensive unit tests for an Atomic Lit component using established patterns from `../instructions/tests-atomic.instructions.md`.

**All commands run from `packages/atomic` directory.**

## Prerequisites

Read `../instructions/tests-atomic.instructions.md` before starting.

**Component structure knowledge:**
- Molecules - Integrate with Headless controllers (search-box, facets, pager)
- Atoms - Basic UI elements (buttons, icons)
- Enzymes - Complex business logic components

**Determine testability:** If component isn't a molecule or doesn't integrate with Headless, this prompt may not apply.

## Find Similar Tested Components

**First, find equivalent components in other use cases (search/commerce/insight/recommendations) with existing Lit tests.**

**Example:** Testing `atomic-query-error` (search) → look for `atomic-commerce-query-error/*.spec.ts` (commerce)

**How to identify:**
- Extract base name: `atomic-[use-case-]component-name` → `component-name`
- Search other use case folders for `atomic-*{base-name}*.spec.ts`
- Verify Lit tests: imports from `.ts` (not `.tsx`), uses `renderInAtomic*Interface` helpers

**Analyze similar test file for:**
- `renderComponent` helper structure
- Locator patterns (`page.getByRole`, shadow parts)
- Console mocking strategy (nested describe blocks for errors)
- Controller mocking approach
- Test organization and assertion patterns

**If no similar tests found:** Ask user if they know of one to reference.

**Include pattern discovery as a todo item:**
- [ ] Find and analyze similar tested component in other use cases

## Analysis Phase

Before writing tests:

1. **Find and analyze similar tested component in other use cases** (see "Find Similar Tested Components" section above)
2. **Verify test fixtures exist** - Check `vitest-utils/testing-helpers/fixtures/headless/{interface}/` for `buildFake{ControllerName}`. If missing, create following pattern from similar fixture (e.g., `summary-controller.ts`):
   ```typescript
   export const defaultState = {...} satisfies ControllerState;
   export const defaultImplementation = {
     subscribe: genericSubscribe,
     state: defaultState,
   } satisfies Controller;
   export const buildFakeController = ({implementation, state} = {}) => ({
     ...defaultImplementation,
     ...implementation,
     ...(state && {state: {...defaultState, ...state}}),
   });
   ```
3. Read component implementation
4. Identify public API: properties, methods, events
5. **Verify component type** - Stop if not a molecule/enzyme integrating with Headless
6. Note Headless controller dependencies
7. Check for i18n or custom styling requirements
8. **Identify console logging scenarios:**
   - `@bindStateToController` decorator (logs errors on missing initialize/controller)
   - Parent element requirements (logs errors when rendered outside required parent)
   - Prop validation with console warnings
   - Deprecated prop usage

## Test File Pattern

Reference: `packages/atomic/scripts/generate-component-templates/component.spec.ts.hbs`

```typescript
import {buildController, type ControllerState} from '@coveo/headless';
import {page} from '@vitest/browser/context';
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
    vi.mocked(buildController).mockReturnValue(mockedController);

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

**Key patterns from actual codebase:**
- Return `{element, locators, parts}` from render function for clean test access
- Use `page.getByRole()` for semantic locators
- Define `parts()` function for shadow DOM queries
- Mock headless with `vi.mock('@coveo/headless', {spy: true})`
- Use `ifDefined()` for optional props/content

## Critical Patterns

**✅ DO:**
```typescript
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
```

**❌ DON'T:**
```typescript
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

// Don't manually create controller mocks
const mockController = {state: {}, subscribe: vi.fn()};
```

## Test Coverage Checklist

**Pattern Analysis:**
- [ ] Found and analyzed similar component's test file in other use case
- [ ] Identified render helper patterns from similar component
- [ ] Noted locator/assertion patterns from similar component

**Properties:**
- [ ] Valid props → no error
- [ ] Invalid props → error with specific message

**Controller Integration:**
- [ ] Controller built with engine
- [ ] State bound via `@bindStateToController`
- [ ] Methods called on user interaction

**Rendering:**
- [ ] Shadow parts present/conditional
- [ ] Slotted content
- [ ] Event handlers
- [ ] Error state variations (if component handles errors)

**Lifecycle:**
- [ ] Event listener cleanup (if component adds listeners)

## Post-Execution Summary

Generate execution summary at `.github/prompts/.executions/generate-vitest-tests-[component]-[YYYY-MM-DD-HHmmss].prompt-execution.md` following `TEMPLATE.prompt-execution.md`. Include reference component used, issues encountered, ambiguities requiring interpretation, and concrete improvement suggestions. Inform user of summary location.


````
```
