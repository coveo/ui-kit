---
applyTo: '**/atomic/**/*.spec.{ts}'
---

## When writing unit tests in Atomic:

- Wrap all test cases in a given spec file under a single describe whose description is the name of the atom, molecule, enzyme, or utils file being tested.
- For individual test cases, always use the it Vitest function (not test).
- Always start an it description with should.
- When there is a single behavior to test under a certain condition, use an it with a description in the form of should … when ….
- Where there are multiple behaviors to test under a certain condition, wrap the its in a describe with a description in the form of when ….
- You can nest describe conditions if necessary.
- Clean up the document in the beforeEach instead of the afterEach, so that the component stays visible in the DOM after running a single test.
- When mentioning the name of a function, method, class, event, or attribute, in a description, prefix it with # (e.g., #myFunction, #MyClass, etc.).
- When testing a public class method (or an exported util function), wrap all tests for that method or function in a describe with a description in the form of #methodOrFunctionName.
- Explicitly import all Vitest functions you are using in your test suite (e.g., it, describe, beforeEach, etc.).
- When your tests are expected to log errors, warnings, etc., mock the logger to ensure that test logs remain clean.

## Using Vitest Testing Utilities

The Atomic package provides comprehensive testing utilities in the `vitest-utils` directory to help with testing components. Always use these utilities instead of writing custom setup code.

### Main Rendering Utilities

- **`renderInAtomicCommerceInterface<T>()`** - Primary utility for testing commerce components within an interface context
- **`fixture<T>()`** - Basic utility for rendering standalone Lit elements
- **`fixtureCleanup()`** - Cleanup utility (automatically called after each test)

### Headless Mocking Utilities

Use the `buildFake*` utilities from `vitest-utils/testing-helpers/fixtures/headless/commerce/` to mock headless controllers:

- **`buildFakePager()`** - Mock pagination controller
- **`buildFakeProductListing()`** - Mock product listing controller
- **`buildFakeSearch()`** - Mock search controller
- **`buildFakeInstantProducts()`** - Mock instant products controller
- **`buildFakeSort()`** - Mock sort controller
- And other `buildFake*` utilities as needed

### Required Imports and Setup

Always include these imports in your commerce component tests:

```typescript
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFake*} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/*-controller';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {page} from 'vitest/browser';
import {html} from 'lit';

// Mock headless at the top level
vi.mock('@coveo/headless/commerce', {spy: true});
```

### Creating Render Functions

Create a reusable render function that sets up mocked dependencies:

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
      // Configure other bindings as needed
      return bindings;
    },
  });

  return element;
};
```

### Using Page Locators

Use page locators from `vitest/browser` for element selection:

```typescript
const locators = {
  button: page.getByRole('button'),
  specificElement: page.getByLabelText('Label Text'),
  parts: (element: ComponentType) => {
    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part="${part}"]`);
    return {
      mainButton: qs('main-button'),
      secondaryButton: qs('secondary-button'),
    };
  },
};
```

### Component Test Structure

Structure your component tests following this pattern:

```typescript
describe('atomic-component-name', () => {
  // Setup render function here

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
});
```

Atom example

```typescript
// my-atom.spec.ts
import {describe, it} from 'vitest';

describe('#renderMyAtom', () => {
  it('should ...', () => {
    /* ... */
  });
  it('should ... when ...', () => {
    /* ... */
  });
  describe('when ...', () => {
    it('should ...', () => {
      /* ... */
    });
    it('should ...', () => {
      /* ... */
    });
  });
});
```

Molecule example

```typescript
// atomic-my-molecule.spec.ts
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeController} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/controller';
import {buildHeadlessFunction} from '@coveo/headless/commerce';
import {page} from 'vitest/browser';
import {html} from 'lit';
import {describe, it, vi, expect, beforeEach} from 'vitest';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-my-molecule', () => {
  const locators = {
    mainButton: page.getByRole('button'),
    specificElement: page.getByLabelText('Label'),
  };

  const renderMolecule = async (options = {}) => {
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

    const {element} = await renderInAtomicCommerceInterface<AtomicMyMolecule>({
      template: html`<atomic-my-molecule></atomic-my-molecule>`,
      selector: 'atomic-my-molecule',
      bindings: (bindings) => {
        bindings.interfaceElement.type = 'product-listing';
        bindings.store.onChange = vi.fn();
        return bindings;
      },
    });

    return element;
  };

  it('should render correctly', async () => {
    const element = await renderMolecule();
    expect(element).toBeDefined();
  });

  it('should handle interaction when button is clicked', async () => {
    await renderMolecule();
    await locators.mainButton.click();
    // Test expectations
  });

  describe('when specific state is active', () => {
    beforeEach(async () => {
      await renderMolecule({activeState: true});
    });

    it('should display correctly', async () => {
      await expect.element(locators.specificElement).toBeVisible();
    });
  });

  describe('#myPublicMethod', () => {
    it('should perform action', async () => {
      const element = await renderMolecule();
      const result = element.myPublicMethod();
      expect(result).toBe('expected');
    });

    it('should handle error when invalid input provided', async () => {
      const element = await renderMolecule();
      expect(() => element.myPublicMethod('invalid')).toThrow();
    });

    describe('when method has complex conditions', () => {
      beforeEach(async () => {
        await renderMolecule({complexState: true});
      });

      it('should handle complex case', async () => {
        // Test implementation
      });

      it('should validate complex input', async () => {
        // Test implementation
      });
    });
  });
});
```

Enzyme example

```typescript
// my-enzyme.spec.ts
import {describe, it} from 'vitest';

describe('#MyEnzymeClassName', () => {
  it('should ...', () => {
    /* ... */
  });
  it('should ... when ...', () => {
    /* ... */
  });
  describe('when ...', () => {
    it('should ...', () => {
      /* ... */
    });
  });
  describe('#myPublicMethod', () => {
    it('should ...', () => {
      /* ... */
    });
    it('should ... when ...', () => {
      /* ... */
    });
    describe('when ...', () => {
      it('should ...', () => {
        /* ... */
      });
      it('should ...', () => {
        /* ... */
      });
    });
  });
});
```

Utils file example

```typescript
// my-utils-file.spec.ts
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {html} from 'lit';
import {describe, it, vi, expect, beforeEach} from 'vitest';
import {myUtilFunction1, myUtilFunction2} from './my-utils-file';

// Mock external dependencies if needed
vi.mock('external-library', () => ({
  externalFunction: vi.fn(),
}));

describe('my-utils-file', () => {
  describe('#myUtilFunction1', () => {
    it('should return expected result', () => {
      const result = myUtilFunction1('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case when input is empty', () => {
      const result = myUtilFunction1('');
      expect(result).toBe('default');
    });

    describe('when complex conditions are met', () => {
      beforeEach(() => {
        // Setup complex state
        vi.mocked(externalFunction).mockReturnValue('mocked-value');
      });

      it('should process complex input correctly', () => {
        const result = myUtilFunction1('complex-input');
        expect(result).toContain('mocked-value');
      });

      it('should validate complex scenario', () => {
        expect(() => myUtilFunction1('invalid-complex')).toThrow();
      });
    });
  });

  describe('#myUtilFunction2', () => {
    it('should transform data correctly', () => {
      const input = {prop: 'value'};
      const result = myUtilFunction2(input);
      expect(result).toEqual({prop: 'transformed-value'});
    });

    it('should handle async operation when promise is involved', async () => {
      const promise = myUtilFunction2Async('input');
      await expect(promise).resolves.toBe('async-result');
    });

    describe('when i18n is required', () => {
      let i18n: i18n;

      beforeEach(async () => {
        i18n = await createTestI18n();
      });

      it('should use i18n correctly', () => {
        const result = myUtilFunction2WithI18n('key', i18n);
        expect(result).toBe('translated-value');
      });

      it('should fallback when translation missing', () => {
        const result = myUtilFunction2WithI18n('missing-key', i18n);
        expect(result).toBe('missing-key');
      });
    });
  });
});
```

### Important Guidelines

- **Always mock headless at the top level** with `vi.mock('@coveo/headless/commerce', {spy: true})`
- **Use `beforeEach` for setup, not `afterEach`** - the framework handles cleanup automatically
- **Prefer `renderInAtomicCommerceInterface`** over `fixture` for commerce components to ensure proper context
- **Mock logger when tests log errors/warnings** to keep test output clean
- **Use page locators** from `vitest/browser` for better test reliability
- **Create reusable render functions** to avoid duplication and ensure consistent setup
- **Use `buildFake*` utilities** instead of creating manual mocks for headless controllers

To run the tests, use the following command:

```bash
npx vitest --config vitest.config.ts ./src/**/*.spec.ts --run
```

- Replace `./src/**/*.spec.ts` with the path to your test files
- Run in the packages/atomic directory
