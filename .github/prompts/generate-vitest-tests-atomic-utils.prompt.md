---
agent: 'agent'
description: 'Generate comprehensive Vitest unit tests for utility functions in the Atomic package'
---

# Generate Vitest Tests for Atomic Utils Functions

You are a senior web developer with expertise in the Atomic Lit framework and Vitest testing library. You understand the structure and conventions of the UI Kit project, particularly how to write unit tests for functional components that return Lit templates. Your goal is to create comprehensive Vitest unit tests for utility functions in the Atomic package, following the established patterns and conventions in the UI Kit project.

**Note: All commands in this guide should be run from the `packages/atomic` directory.**

## Task Overview

You will be asked to add unit tests for a specific utility module in the Atomic package. These utility functions are typically pure functions that perform data transformations, validations, or other business logic operations. Follow the guidelines from the [atomic testing instructions](../instructions/tests-atomic.instructions.md) and create a complete test suite that covers all functionality.

## Prerequisites and Context

### Required Knowledge

- **Vitest testing framework** - Modern, fast unit testing with mocking capabilities
- **TypeScript** - Strong typing, interfaces, and utility types
- **Utility function patterns** - Pure functions, side effects, error handling
- **Atomic package architecture** - Helper functions, validators, formatters, and business logic utilities
- **Testing best practices** - Edge cases, boundary conditions, and error scenarios

### Project Context

The Atomic package contains numerous utility functions that provide:

- **Data transformation** - Formatters, parsers, converters
- **Validation logic** - Input validation, type checking, business rules
- **Helper functions** - Common operations, calculations, string manipulation
- **Business logic** - Domain-specific operations, commerce utilities
- **Event handling** - Debouncing, throttling, event utilities
- **Accessibility** - ARIA helpers, focus management, screen reader utilities

## Understanding Utils Functions

Utility functions in the Atomic package are:

- **Pure functions** when possible (same input → same output, no side effects)
- **Exported functions** from modules in `src/utils/` or component-specific utilities
- **Focused on single responsibility** - each function has one clear purpose
- **Well-typed** with TypeScript interfaces and proper return types
- **Testable in isolation** - minimal dependencies, clear inputs/outputs

## Step-by-Step Instructions

### 1. Analyze the Utility Functions

Before writing tests, understand the utility module:

- **Read the utility file** - identify all exported functions
- **Understand function signatures** - parameters, return types, overloads
- **Identify dependencies** - external libraries, other utils, global state
- **Note side effects** - DOM manipulation, async operations, logging
- **Check for error handling** - what errors can be thrown, validation logic
- **Look for edge cases** - null/undefined inputs, empty arrays, boundary values

### 2. Set Up Test File Structure

Create a `.spec.ts` file in the same directory as the utility file:

```typescript
// Essential imports - adjust based on utility needs
import {utilFunction1, utilFunction2} from '@/src/utils/utility-file-name';
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  MockInstance,
} from 'vitest';

// Preferred mocking style - use {spy: true} when possible
vi.mock('@/src/utils/utils', {spy: true});
vi.mock('@coveo/headless/commerce');

// Mock external dependencies only when necessary
vi.mock('external-library', () => ({
  externalFunction: vi.fn(),
}));
```

**Mock cleanup:** Automatic via `restoreMocks: true` in `vitest.config.js`. Only add explicit cleanup when:
- Using fake timers (`vi.useFakeTimers()` requires `vi.useRealTimers()` in `afterEach`)
- Mocking browser APIs that need restoration (navigator, window properties)

```typescript
// Only needed for timers or browser API mocks
afterEach(() => {
  vi.useRealTimers(); // Required when using vi.useFakeTimers()
});
```

### 3. Create Test Suite Structure

Follow the established naming conventions from `.github/instructions/tests-atomic.instructions.md`:

- **Top-level describe**: Use the module file name without extension (e.g., `'device-utils'`, `'compare-utils'`)
- **Function describes**: Use `'#functionName'` for each exported function
- **Condition describes**: Use `'when [condition]'` or `'#methodName'` sparingly for complex scenarios
- **Test cases**: Always start with `'should'`
- **Prefer flatter structure** over deeply nested describes

**Example:**
```typescript
describe('device-utils', () => {
  describe('#isIOS', () => {
    it('should return true for iPad user agent', () => {
      // ...
    });
  });
});
```

### 4. Write Comprehensive Test Cases

#### A. Pure Functions (No Side Effects)

```typescript
describe('compare-utils', () => {
  describe('#deepEqual', () => {
    it('should return true for identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('hello', 'hello')).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('hello', 'world')).toBe(false);
    });

    it('should handle nested arrays correctly', () => {
      expect(deepEqual([[1, 2]], [[1, 2]])).toBe(true);
      expect(deepEqual([[1, 2]], [[1, 3]])).toBe(false);
    });

    it('should throw error when input is invalid', () => {
      expect(() => deepEqual(null, undefined)).not.toThrow();
    });
  });
});
```

#### B. Functions with Side Effects and Timers

```typescript
describe('promise-utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#promiseTimeout', () => {
    it('should resolve when promise completes before timeout', async () => {
      const result = promiseTimeout(Promise.resolve('success'), 1000);
      await expect(result).resolves.toBe('success');
    });

    it('should reject when promise exceeds timeout', async () => {
      const slowPromise = new Promise((resolve) => 
        setTimeout(() => resolve('late'), 2000)
      );
      const result = promiseTimeout(slowPromise, 1000);

      vi.advanceTimersByTime(1000);
      await expect(result).rejects.toThrow('Promise timed out.');
    });

    it('should handle multiple concurrent timeouts', async () => {
      const p1 = promiseTimeout(Promise.resolve('fast'), 1000);
      const p2 = new Promise((resolve) => setTimeout(() => resolve('slow'), 2000));
      const p2Timeout = promiseTimeout(p2, 1000);

      await expect(p1).resolves.toBe('fast');
      
      vi.advanceTimersByTime(1000);
      await expect(p2Timeout).rejects.toThrow('Promise timed out.');
    });
  });
});
```

#### C. Browser API Mocking

```typescript
describe('device-utils', () => {
  let originalUserAgent: string;
  let originalMaxTouchPoints: number;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
    originalMaxTouchPoints = navigator.maxTouchPoints;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: originalUserAgent,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: originalMaxTouchPoints,
    });
  });

  describe('#isIOS', () => {
    it('should return true for iPad user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
      });
      expect(isIOS()).toBe(true);
    });

    it('should return true for Macintosh with touch screen', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 5,
      });
      expect(isIOS()).toBe(true);
    });

    it('should return false for Android user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Linux; Android 10)',
      });
      expect(isIOS()).toBe(false);
    });
  });
});
```

#### D. Functions with i18n Dependencies

```typescript
describe('i18n-utils', () => {
  let i18n: I18n;

  beforeAll(async () => {
    i18n = await createTestI18n(); // From vitest-utils/testing-helpers
  });

  describe('#formatWithI18n', () => {
    it('should use i18n correctly', () => {
      const result = formatWithI18n('translation-key', i18n);
      expect(result).toContain('Translated Text');
    });

    it('should handle interpolation values', () => {
      const result = formatWithI18n('greeting', i18n, {name: 'John'});
      expect(result).toBe('Hello, John!');
    });

    it('should fallback to key when translation is missing', () => {
      const result = formatWithI18n('missing-key', i18n);
      expect(result).toBe('missing-key');
    });
  });
});
```

**Note:** Use `beforeAll` for i18n setup (not `beforeEach`) to avoid repeated initialization overhead.

#### E. Class-based Utilities

#### E. Class-based Utilities

```typescript
describe('UtilityClassName', () => {
  let instance: UtilityClassName;

  beforeEach(() => {
    instance = new UtilityClassName({option: 'value'});
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultInstance = new UtilityClassName();
      expect(defaultInstance.option).toBe('default');
    });

    it('should merge provided options with defaults', () => {
      expect(instance.option).toBe('value');
    });
  });

  describe('#publicMethod', () => {
    it('should return expected result', () => {
      const result = instance.publicMethod('input');
      expect(result).toBe('expected');
    });

    it('should maintain internal state correctly', () => {
      instance.publicMethod('input1');
      instance.publicMethod('input2');
      expect(instance.getState()).toEqual(['input1', 'input2']);
    });
  });
});
```

**For additional patterns**, see existing test files in `packages/atomic/src/utils/*.spec.ts`.

## Common Patterns and Best Practices

### Test Organization

- **Top-level describe** matches utility module name (e.g., `'device-utils'`, `'compare-utils'`)
- **Function describes** use `'#functionName'` pattern for each exported function
- **Nest conditions** with `'when [condition]'` describes only for complex scenarios
- **Group related tests** logically together
- **Test edge cases** thoroughly

### Mocking Guidelines

- **Mock external dependencies** that are not part of the test scope
- **Use `vi.fn()`** for function mocks
- **Mock timers** when testing debounce/throttle functions with `vi.useFakeTimers()` / `vi.useRealTimers()`
- **Mock browser APIs** when utilities interact with navigator, window, etc. (restore in `afterEach`)
- **Avoid unnecessary cleanup** - `restoreMocks: true` handles most cases automatically

### Data Testing Patterns

- **Test with various data types** - strings, numbers, arrays, objects, null, undefined
- **Test boundary conditions** - empty arrays, zero values, max/min numbers
- **Test error conditions** - invalid inputs, malformed data
- **Test type coercion** - how functions handle unexpected types

### Async Testing

- **Use `async/await`** for promise-based functions
- **Test both success and failure** scenarios  
- **Mock async dependencies** appropriately
- **Use fake timers** for timeout testing with `vi.useFakeTimers()` and `vi.advanceTimersByTime()`

## Common Pitfalls and Corrections

### ❌ Incorrect Approaches

```typescript
// Don't test implementation details
it('should call internal helper function', () => {
  const spy = vi.spyOn(utils, 'internalHelper');
  utils.publicFunction();
  expect(spy).toHaveBeenCalled();
});

// Don't ignore error cases
it('should work with valid input', () => {
  expect(utils.parse('valid')).toBe('result');
  // Missing: what happens with invalid input?
});

// Don't use vague test descriptions
it('should work correctly', () => {
  // Too vague - what behavior is being tested?
});
```

### ✅ Correct Approaches

```typescript
// Test public behavior and outputs
it('should return formatted string for valid input', () => {
  const result = utils.formatString('input');
  expect(result).toBe('FORMATTED: input');
});

// Test error handling explicitly
it('should throw ValidationError when input is malformed', () => {
  expect(() => utils.parse('malformed')).toThrow(ValidationError);
});

// Use specific, behavior-focused descriptions
it('should convert camelCase to kebab-case', () => {
  const result = utils.camelToKebab('myVariableName');
  expect(result).toBe('my-variable-name');
});
```

## Constraints and Limitations

### Focus Areas

- **Test public APIs** - exported functions and classes
- **Focus on behavior** - what the function does, not how
- **Test error scenarios** - validation and edge cases
- **Verify side effects** - DOM changes, state mutations

### Areas to Avoid

- **Don't test implementation details** - internal helper functions
- **Don't test external libraries** - assume they work correctly
- **Don't over-mock** - only mock what's necessary for isolation
- **Don't ignore TypeScript** - use proper typing in tests

### Performance Considerations

- **Mock expensive operations** - file I/O, network calls, heavy computations
- **Use fake timers** for time-dependent functions
- **Keep tests fast** - avoid unnecessary delays or real DOM manipulation

## Verification

Before completing, ensure:

1. **Top-level describe matches module name** (e.g., `describe('device-utils')`)
2. **Function tests use `#functionName`** pattern (e.g., `describe('#isIOS')`)
3. **Mock cleanup** only present when using fake timers or browser API mocks
4. **Tests pass** when run with `npx vitest ./src/utils/<file>.spec.ts --run`
5. **All exported functions are tested** with main functionality and key edge cases covered

## Running Tests

To run your utility tests:

```bash
# Run all tests in the utils directory
npx vitest --config vitest.config.ts ./src/utils/**/*.spec.ts --run

# Run a specific test file
npx vitest --config vitest.config.ts ./src/utils/your-utility.spec.ts --run

# Run tests in watch mode during development
npx vitest --config vitest.config.ts ./src/utils/your-utility.spec.ts
```

## Important Notes

- **Mock external dependencies** but not the utility functions themselves
- **Test both happy path and error cases** for comprehensive coverage
- **Use descriptive test names** that explain the expected behavior
- **Group related tests** using nested `describe` blocks when appropriate
- **Follow established patterns** from existing utility test files in `packages/atomic/src/utils/*.spec.ts`
- **Consider performance** - mock expensive operations to keep tests fast

The goal is to create a comprehensive test suite that validates the utility functions work correctly across all scenarios while maintaining the high quality standards of the UI Kit project.
