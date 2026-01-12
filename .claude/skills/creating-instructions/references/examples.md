# Instruction Examples

## Example: Package-Specific Instruction

```markdown
---
applyTo: 'packages/atomic/**'
---

# Atomic Component Conventions

**All new Atomic components must be Lit components, not Stencil.**

## Component Structure

Each component directory contains:
- `atomic-name.ts` - Main component
- `atomic-name.tw.css.ts` - Tailwind styles
- `atomic-name.spec.ts` - Unit tests

## Naming

- Tag: `atomic-kebab-case`
- File: `atomic-kebab-case.ts`
- Class: `AtomicPascalCase`

## Required Decorators

```typescript
@customElement('atomic-my-component')
export class AtomicMyComponent extends LitElement {
  @property({type: String}) label = '';
  @state() private isOpen = false;
}
```
```

## Example: Test Instruction

```markdown
---
applyTo: '**/atomic/**/*.spec.ts'
---

# Atomic Test Patterns

## File Structure

```typescript
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('atomic-component-name', () => {
  const renderComponent = async (props = {}) => {
    // Setup
  };

  it('should render with default props', async () => {
    // One assertion
  });
});
```

## Naming

- Describe: Component tag name
- It: `should [behavior] when [condition]`

## Mocking

Use `buildFake*` fixtures from `vitest-utils/testing-helpers/fixtures/headless/`.
```

## Example: Technology-Specific Instruction

```markdown
---
applyTo: 'packages/atomic/**/*.stories.tsx'
---

# Storybook MSW Mocking

## Required Pattern

```typescript
import {MockSearchApi} from '@/storybook-utils/api/search/mock';

const searchApiHarness = new MockSearchApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
};
```

## Modifying Responses

```typescript
export const NoResults: Story = {
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
    }));
  },
};
```
```

## Example: Cross-Cutting Instruction

```markdown
---
applyTo: '**'
---

# General Coding Principles

## Instruction Hierarchy

When instructions conflict:
1. Workspace prompts
2. Package-specific (atomic.instructions.md)
3. File-type specific (general.typescript.instructions.md)
4. This file

## Core Principles

**Correctness over helpfulness.** Don't blindly follow incomplete code.

**Favor established patterns.** Default to widely accepted, maintainable code.

## Documentation

- Self-documenting code over comments
- JSDoc for public APIs
- Inline comments only for non-obvious logic
```
