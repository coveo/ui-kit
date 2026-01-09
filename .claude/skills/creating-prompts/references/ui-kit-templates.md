# UI-Kit Prompt Templates

Pre-built templates for common ui-kit prompt types.

## Component Creation Template

For prompts that generate new Atomic components.

```markdown
---
agent: 'agent'
description: Creates a new [specific type] Atomic component
tools:
  - changes
  - codebase
  - terminalLastCommand
---

# [Component Type] Creator

You create [specific type] Atomic Lit components for the ui-kit monorepo.

## Prerequisites

Run the component generator first:
```bash
node scripts/generate-component.mjs {{COMPONENT_NAME}} src/components/{{FOLDER}}
```

## Requirements

1. **Lit Standards**
   - `@customElement('atomic-{{name}}')` decorator
   - `@property` with JSDoc for public props
   - `@state` for internal state
   - Shadow DOM with Tailwind styles

2. **Accessibility (WCAG 2.2 AA)**
   - Semantic HTML elements
   - ARIA labels where needed
   - Keyboard navigation support

3. **Documentation**
   - JSDoc on all public APIs
   - Storybook story (*.new.stories.tsx)
   - MDX documentation

## Output Files

Generate these files:
- `atomic-{{name}}.ts` - Component
- `atomic-{{name}}.tw.css.ts` - Styles
- `atomic-{{name}}.spec.ts` - Unit tests
- `atomic-{{name}}.new.stories.tsx` - Storybook
```

## Test Generation Template

For prompts that generate tests for existing code.

```markdown
---
agent: 'agent'
description: Generates [test type] tests for [target]
tools:
  - changes
  - codebase
---

# [Test Type] Generator

You generate comprehensive tests following ui-kit conventions.

## Test Structure

### Unit Tests (Vitest)
```typescript
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('{{target}}', () => {
  // Render helper pattern
  const renderComponent = async (props = {}) => {
    // Setup
  };

  describe('when [condition]', () => {
    it('should [behavior]', async () => {
      // One assertion per test
    });
  });
});
```

### E2E Tests (Playwright)
```typescript
import {test, expect} from '@playwright/test';

test.describe('{{target}}', () => {
  test('should [user journey]', async ({page}) => {
    // Happy path + accessibility
  });
});
```

## Coverage Requirements

- [ ] Default state rendering
- [ ] Prop variations
- [ ] User interactions
- [ ] Error states
- [ ] Accessibility (keyboard, screen reader)
```

## Migration Template

For prompts that migrate between technologies.

```markdown
---
agent: 'agent'
description: Migrates [source] to [target]
tools:
  - changes
  - codebase
  - terminalLastCommand
---

# [Source] to [Target] Migration

You migrate code from [source] to [target] while preserving functionality.

## Migration Mapping

| Source | Target |
|--------|--------|
| [old pattern] | [new pattern] |
| [old decorator] | [new decorator] |

## Process

1. **Analyze** - Read source file completely
2. **Map** - Identify all patterns to convert
3. **Convert** - Apply migration mappings
4. **Test** - Verify tests still pass
5. **Document** - Update any changed APIs

## Validation

Run after migration:
```bash
pnpm lint:fix --filter=@coveo/atomic
pnpm test --filter=@coveo/atomic
```

## Common Pitfalls

- Don't forget to update imports
- Preserve all existing functionality
- Maintain accessibility compliance
```

## Documentation Template

For prompts that generate documentation.

```markdown
---
agent: 'agent'
description: Documents [target type]
tools:
  - codebase
  - changes
---

# [Target Type] Documenter

You generate comprehensive documentation for [target type].

## Documentation Types

### MDX Component Docs
```mdx
import {Meta, Canvas, Controls} from '@storybook/blocks';
import * as Stories from './{{name}}.new.stories';

<Meta of={Stories} />

# {{ComponentName}}

Brief description of the component's purpose.

## Usage

<Canvas of={Stories.Default} />

## Props

<Controls />

## Accessibility

- Keyboard navigation: [describe]
- Screen reader: [describe]
```

### JSDoc
```typescript
/**
 * The `atomic-{{name}}` component [brief description].
 *
 * @part container - The main container element.
 * @part button - The action button.
 *
 * @slot default - Content to display inside.
 *
 * @event {{name}}-action - Fired when [trigger].
 */
```

## Style Guidelines

- Start descriptions with "The" or "A"
- Document all public properties
- Include usage examples
- Note accessibility considerations
```

## Code Review Template

For prompts that review code quality.

```markdown
---
agent: 'agent'
description: Reviews [code type] for [quality aspects]
tools:
  - codebase
---

# [Code Type] Reviewer

You review code for quality, following ui-kit standards.

## Review Checklist

### Code Quality
- [ ] Type safety (no unnecessary `any`)
- [ ] Defensive programming (null checks, try-catch)
- [ ] Resource cleanup (disconnectedCallback)

### Conventions
- [ ] Naming follows conventions
- [ ] Import organization (path aliases)
- [ ] JSDoc on public APIs

### Accessibility
- [ ] WCAG 2.2 AA compliance
- [ ] Semantic HTML
- [ ] Keyboard navigable

### Testing
- [ ] Unit tests present
- [ ] One behavior per test
- [ ] Descriptive test names

## Output Format

For each issue found:
```
**[Severity]**: [Brief description]
Location: [file:line]
Issue: [Detailed explanation]
Suggestion: [How to fix]
```
```
