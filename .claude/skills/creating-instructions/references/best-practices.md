# Best Practices for Custom Instructions

## Core Principle: Auto-Applied Guidelines

Instructions are **automatically applied** when file patterns match. They influence AI behavior without user invocation.

**Think of instructions as:**
- Coding standards that apply in the background
- Context that enhances AI understanding
- Rules that guide code generation automatically

**Instructions are NOT:**
- User-invoked workflows (that's a prompt)
- One-time tasks (that's an ephemeral response)
- Scripts or tools (that's a skill)

## Pattern Specificity

### Use Specific Patterns

**DO:** Target the narrowest scope needed
```yaml
applyTo: 'packages/atomic/src/components/**/*.spec.ts'
```

**DON'T:** Use overly broad patterns
```yaml
applyTo: '**'  # Only for truly universal rules
```

### Common Pattern Anti-Patterns

| ❌ Avoid | ✅ Prefer | Reason |
|---------|----------|--------|
| `**` for package rules | `packages/atomic/**` | Too broad, conflicts likely |
| `**/*.ts` for test rules | `**/*.spec.ts` | Tests need different rules |
| Multiple unrelated patterns | Separate instructions | Easier to maintain |

## Content Quality

### Start Strong

**DO:** Lead with the most critical rule
```markdown
**All new Atomic components must be Lit components, not Stencil.**
```

**DON'T:** Bury important info
```markdown
This document provides guidance on component creation...
[5 paragraphs later]
...use Lit, not Stencil.
```

### Be Specific

**DO:** Provide concrete examples
```typescript
@customElement('atomic-my-component')
export class AtomicMyComponent extends LitElement {
  @property({type: String}) label = '';
}
```

**DON'T:** Use vague language
```markdown
Use appropriate decorators and follow good patterns.
```

### Avoid Duplication

**DO:** Reference other instructions
```markdown
Follow [general TypeScript conventions](./general.typescript.instructions.md) 
with these Atomic-specific additions:
```

**DON'T:** Copy content from other files
```markdown
[Repeating 50 lines from general.typescript.instructions.md]
```

## Instruction Hierarchy Management

### Document Precedence

When conflicts are possible, document the hierarchy:

```markdown
## Instruction Hierarchy

When instructions conflict, apply this precedence order:

1. Workspace prompts (highest priority)
2. Package-specific (e.g., `atomic.instructions.md`)
3. File-type specific (e.g., `general.typescript.instructions.md`)
4. General (this file)
5. Language/framework defaults (lowest priority)
```

### Check for Conflicts

Before creating a new instruction:

```bash
# List existing instructions with similar scope
for f in .github/instructions/*.instructions.md; do
  echo "=== $f ==="
  grep "applyTo:" "$f"
done
```

## VS Code Terminology

Use consistent terminology from VS Code documentation:

| ✅ Correct | ❌ Avoid |
|-----------|----------|
| "Auto-applied" | "Triggered", "Activated" |
| "Pattern matching" | "File filtering" |
| "Frontmatter" | "Metadata", "Header" |
| "Glob pattern" | "File glob", "Pattern" |
| "Instructions combine" | "Instructions override" |

## File References

Instructions can reference other workspace files:

**Markdown links:**
```markdown
Follow the [Design System](../docs/design-system/Form.md) patterns.
```

**When to use:**
- Referencing existing documentation
- Linking to examples or templates
- Pointing to related instruction files

**Benefits:**
- AI can fetch and understand referenced content
- Reduces duplication
- Keeps instructions concise

## Examples Reference

### Package-Specific Instruction

```markdown
---
applyTo: 'packages/atomic/**'
description: 'Atomic component conventions'
---

# Atomic Component Guidelines

**All new components must be Lit components, not Stencil.**

## Structure

Each component directory contains:
- `atomic-name.ts` - Main component
- `atomic-name.spec.ts` - Tests
- `atomic-name.new.stories.tsx` - Storybook stories

[Continue with specific rules...]
```

### Test Instruction

```markdown
---
applyTo: '**/*.spec.ts'
description: 'Unit test conventions'
---

# Test Patterns

## Naming

```typescript
describe('component-name', () => {
  it('should [behavior] when [condition]', async () => {
    // Test
  });
});
```

[Continue with test-specific guidance...]
```

### Cross-Cutting Instruction

```markdown
---
applyTo: '**'
description: 'Accessibility guidelines for all code'
---

# Accessibility Requirements

All code must conform to [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/).

## Interactive Elements

- All interactive elements must be keyboard accessible
- Provide visible focus indicators
- Use semantic HTML when possible

[Continue with a11y rules...]
```

## Validation Checklist

Before finalizing an instruction:

- [ ] `applyTo` pattern is as specific as possible
- [ ] Most critical rule appears first
- [ ] Concrete examples provided
- [ ] No content duplicated from other instructions
- [ ] Hierarchy documented if conflicts possible
- [ ] VS Code terminology used consistently
- [ ] File references use Markdown link syntax
- [ ] Validation script passes

## Common Pitfalls

### 1. Overly Broad Patterns

**Problem:** `applyTo: '**'` for non-universal rules

**Solution:** Target specific packages or file types

### 2. Vague Language

**Problem:** "Use appropriate patterns and follow best practices"

**Solution:** Show concrete examples of correct usage

### 3. Conflicting Rules

**Problem:** New instruction contradicts existing ones

**Solution:** Document hierarchy or merge with existing instruction

### 4. Missing Context

**Problem:** AI doesn't understand why a rule exists

**Solution:** Add brief rationale for non-obvious rules

### 5. Duplicate Content

**Problem:** Copying rules from other instructions

**Solution:** Reference existing instructions instead
