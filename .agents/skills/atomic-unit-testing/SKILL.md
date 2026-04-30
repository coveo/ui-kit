---
name: atomic-unit-testing
description: Provides conventions, patterns, and fixtures for Vitest unit tests in the Atomic package. Use when writing, modifying, or reviewing unit tests, debugging test failures, or when the user mentions testing, spec files, Vitest, or test coverage in the Atomic package.
license: Apache-2.0
metadata:
  author: coveo
  version: '1.0'
---

# Atomic Unit Testing

## General Conventions

The following conventions apply to all unit tests in the Atomic package, regardless of the entity being tested.

### File Naming

All test files use `<module-name>.spec.ts`, placed next to the source file.

### Vitest Imports

Always import the Vitest APIs you need explicitly:

```typescript
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
```

### Test Structure

**Top-level `describe`:** Always the source file name without extension.

```typescript
// Testing my-module.ts
describe('my-module', () => { ... });
```

**`it` blocks:** Always start with "should". Never use `test()`.

```typescript
it('should render the search button', async () => { ... });
it('should dispatch fetchPage when numberOfResults changes', () => { ... });
```

**When to use nested `describe`:**

- **Multiple tests share a condition** — group them:

```typescript
describe('when query is empty', () => {
  it('should disable the submit button', () => { ... });
  it('should show the placeholder text', () => { ... });
});
```

- **Testing a public exported function or method** — use `#name` prefix:

```typescript
describe('#initialize', () => {
  it('should register reducers', () => { ... });
  it('should dispatch initial state', () => { ... });
});
```

**When NOT to nest:** Single test case for a condition — combine into the `it` name:

```typescript
// ✅ Single case — inline the condition
it('should disable the button when loading', () => { ... });

// ❌ Unnecessary nesting for a single test
describe('when loading', () => {
  it('should disable the button', () => { ... });
});
```

### Test Principles

- **Test behavior, not implementation**: Assert on outputs and observable effects, not internal method calls.
- **One behavior per test**: Multiple assertions for the same behavior are fine; multiple unrelated behaviors are not. Don't test the same behavior multiple ways — if a test already covers a code path, another one adds noise.
- **Use specific assertions**: Prefer `toHaveBeenCalledWith(expected)`, `toHaveTextContent('text')` over loose matchers like `toBeTruthy()` or `toBeDefined()`. Assert on the _what_, not just that something exists.
- **Prefer creation over mutation**: Set up the desired state before the action under test rather than mutating afterward.
- **Test edge cases**: null, undefined, empty strings, empty arrays, boundary values.
- **Test error paths**: Invalid inputs, missing dependencies, network failures.

## Progressive Disclosure

Identify the entity being tested and load the appropriate additional reference:

- **Atomic Lit web component**: `references/atomic-lit-components.md`
- **Atomic Functional component**: `references/atomic-functional-components.md`
- **Atomic Utility function, helper, class-based utility**: `references/atomic-utils.md`
