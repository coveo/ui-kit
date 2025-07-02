---
mode: 'agent'
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

### 3. Create Test Suite Structure

Follow the established naming conventions:

- **Main describe**: Use `'utils'` for utility files (not the filename)
- **Function describes**: Use `'#functionName'` for each exported function
- **Condition describes**: Use `'when [condition]'` sparingly, only for complex scenarios
- **Test cases**: Always start with `'should'`
- **Prefer flatter structure** over deeply nested describes

### 4. Write Comprehensive Test Cases

#### A. Pure Functions (No Side Effects)

```typescript
describe('utility-file-name', () => {
  describe('#pureFunctionName', () => {
    it('should return expected result for valid input', () => {
      const result = pureFunctionName('validInput');
      expect(result).toBe('expectedOutput');
    });

    it('should handle empty input', () => {
      const result = pureFunctionName('');
      expect(result).toBe('defaultValue');
    });

    it('should throw error when input is invalid', () => {
      expect(() => pureFunctionName(null)).toThrow('Invalid input');
    });

    describe('when input has special characters', () => {
      it('should escape special characters', () => {
        const result = pureFunctionName('input<script>');
        expect(result).toBe('input&lt;script&gt;');
      });

      it('should preserve unicode characters', () => {
        const result = pureFunctionName('café');
        expect(result).toBe('café');
      });
    });
  });
});
```

#### B. Functions with Side Effects

```typescript
describe('#functionWithSideEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should perform side effect correctly', () => {
    const mockElement = document.createElement('div');
    functionWithSideEffects(mockElement);

    expect(mockElement.classList.contains('expected-class')).toBe(true);
  });

  it('should handle missing element gracefully', () => {
    expect(() => functionWithSideEffects(null)).not.toThrow();
  });

  describe('when timing is involved', () => {
    it('should debounce calls correctly', () => {
      const callback = vi.fn();
      const debouncedFn = functionWithSideEffects(callback, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
```

#### C. Async Functions

```typescript
describe('#asyncUtilFunction', () => {
  it('should resolve with expected value', async () => {
    const result = await asyncUtilFunction('input');
    expect(result).toBe('expected');
  });

  it('should reject with error when input is invalid', async () => {
    await expect(asyncUtilFunction(null)).rejects.toThrow('Invalid input');
  });

  it('should handle network errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(asyncUtilFunction('input')).rejects.toThrow('Network error');
  });

  describe('when using fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should timeout after specified duration', async () => {
      const promise = asyncUtilFunction('slow-input');

      vi.advanceTimersByTime(5000);

      await expect(promise).rejects.toThrow('Timeout');
    });
  });
});
```

#### D. Functions with i18n Dependencies

```typescript
describe('#functionWithI18n', () => {
  let i18n: I18n;

  beforeEach(async () => {
    i18n = await createTestI18n();
  });

  it('should use i18n correctly', () => {
    const result = functionWithI18n('translation-key', i18n);
    expect(result).toContain('Translated Text');
  });

  it('should fallback to key when translation is missing', () => {
    const result = functionWithI18n('missing-key', i18n);
    expect(result).toBe('missing-key');
  });

  it('should handle interpolation values', () => {
    const result = functionWithI18n('greeting', i18n, {name: 'John'});
    expect(result).toBe('Hello, John!');
  });
});
```

#### E. Class-based Utilities

```typescript
describe('#UtilityClassName', () => {
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

    describe('when method is called multiple times', () => {
      beforeEach(() => {
        instance.publicMethod('setup');
      });

      it('should handle repeated calls', () => {
        const result = instance.publicMethod('repeat');
        expect(result).toBe('expected-repeat');
      });
    });
  });
});
```

## Common Patterns and Best Practices

### Test Organization

- **Single `describe` block** per spec file with utility file name
- **Use `#functionName`** for individual function test groups
- **Nest conditions** with `'when [condition]'` describes
- **Group related tests** logically together
- **Test edge cases** thoroughly

### Mocking Guidelines

- **Mock external dependencies** that are not part of the test scope
- **Use `vi.fn()`** for function mocks
- **Mock timers** when testing debounce/throttle functions
- **Mock DOM APIs** when utilities interact with browser APIs
- **Clear mocks** in `beforeEach` to avoid test interference

### Data Testing Patterns

- **Test with various data types** - strings, numbers, arrays, objects, null, undefined
- **Test boundary conditions** - empty arrays, zero values, max/min numbers
- **Test error conditions** - invalid inputs, malformed data
- **Test type coercion** - how functions handle unexpected types

### Async Testing

- **Use `async/await`** for promise-based functions
- **Test both success and failure** scenarios
- **Mock async dependencies** appropriately
- **Use fake timers** for timeout testing

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

## Validation Checklist

Before submitting your tests, verify:

- [ ] **All exported functions are tested** with comprehensive coverage
- [ ] **Error cases are handled** with appropriate expect statements
- [ ] **Edge cases are covered** including null, undefined, empty values
- [ ] **Async functions use proper async/await** patterns
- [ ] **Mocks are used appropriately** and cleared between tests
- [ ] **Test descriptions are clear** and behavior-focused
- [ ] **File follows naming conventions** - same name as utility file with `.spec.ts`
- [ ] **Imports are organized** and include all necessary Vitest functions
- [ ] **Tests can run independently** without order dependencies
- [ ] **Code coverage is comprehensive** for all branches and conditions

## Usage Examples

### Simple Formatter Utility

```typescript
describe('format-utils', () => {
  describe('#formatCurrency', () => {
    it('should format number as USD currency', () => {
      const result = formatCurrency(123.45, 'USD');
      expect(result).toBe('$123.45');
    });

    it('should handle zero values', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toBe('$0.00');
    });

    it('should throw error for invalid currency code', () => {
      expect(() => formatCurrency(100, 'INVALID')).toThrow('Invalid currency');
    });
  });
});
```

### Validation Utility

```typescript
describe('validation-utils', () => {
  describe('#isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });
  });
});
```

### Debounce Utility

```typescript
describe('debounce-utils', () => {
  describe('#buildDebouncedQueue', () => {
    let queue: DebouncedQueue;

    beforeEach(() => {
      vi.useFakeTimers();
      queue = buildDebouncedQueue({delay: 100});
    });

    afterEach(() => {
      vi.useRealTimers();
      queue.clear();
    });

    it('should execute first action immediately', () => {
      const action = vi.fn();
      queue.enqueue(action);
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('should debounce subsequent actions', () => {
      const action = vi.fn();
      queue.enqueue(() => {}); // First action
      queue.enqueue(action); // Should be debounced

      expect(action).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(action).toHaveBeenCalledTimes(1);
    });
  });
});
```

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
- **Group related tests** using nested `describe` blocks
- **Clean up side effects** in `beforeEach` rather than `afterEach`
- **Follow established patterns** from existing utility test files
- **Consider performance** - mock expensive operations to keep tests fast

The goal is to create a comprehensive test suite that validates the utility functions work correctly across all scenarios while maintaining the high quality standards of the UI Kit project.

## Preferred Test Structure and Style

### Test Organization Patterns

Based on existing codebase patterns, follow these structural preferences:

- **Main describe block**: Use `'utils'` for utility files instead of the filename
- **Function grouping**: Use `describe('#functionName')` but avoid excessive nesting
- **Condition grouping**: Only use `describe('when...')` for truly complex scenarios with multiple related tests
- **Prefer flatter structure** over deeply nested describes

### Import and Mocking Patterns

Follow the existing patterns in the codebase:

```typescript
// Preferred import style
import {utilFunction} from '@/src/utils/utils';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';

// Preferred mocking style - use {spy: true} when possible
vi.mock('@/src/utils/utils', {spy: true});
vi.mock('@coveo/headless/commerce');

// Mock cleanup in afterEach
afterEach(() => {
  vi.restoreAllMocks();
});
```

### Assertion Preferences

- **Use snapshots** for complex objects or return values where appropriate
- **Focus on behavior** rather than implementation details
- **Test essential functionality** first, then key edge cases
- **Avoid over-mocking** - only mock what's necessary for the test

### Example Structure

```typescript
describe('utils', () => {
  describe('#functionName', () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle main functionality', () => {
      const result = functionName(input);
      expect(result).toMatchSnapshot(); // Use snapshots for complex outputs
    });

    it('should handle edge case when condition occurs', () => {
      const result = functionName(edgeCaseInput);
      expect(result).toBe(expectedValue);
    });
  });
});
```
