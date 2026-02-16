# Custom Instruction Specification

Based on [VS Code Copilot Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions).

## Overview

Custom instructions enable you to define common guidelines and rules that **automatically influence how AI generates code**. Instructions apply automatically to all chat requests or to specific files based on pattern matching.

## File Formats

VS Code supports two types of custom instruction files:

### 1. Workspace-Wide Instructions

**File:** `.github/copilot-instructions.md`

**Applies to:** All files in the workspace (no frontmatter needed)

**When to use:**
- Universal coding principles
- Repository-wide conventions
- Cross-cutting concerns (accessibility, security, etc.)

**Example:**
```markdown
# UI-Kit Coding Principles

## Core Values

**Correctness over helpfulness.** Never blindly follow incomplete code.

## Documentation

- JSDoc for all public APIs
- Self-documenting code over comments
```

### 2. Pattern-Specific Instructions

**File:** `.github/instructions/{name}.instructions.md`

**Applies to:** Files matching the `applyTo` glob pattern

**When to use:**
- Package-specific conventions
- File-type specific rules (TypeScript, tests, etc.)
- Technology-specific patterns (Storybook, Playwright, etc.)

**Example:**
```markdown
---
applyTo: 'packages/atomic/**'
description: 'Atomic component conventions for Lit-based components'
---

# Atomic Component Guidelines

**All new components must be Lit components, not Stencil.**

## Required Structure

...
```

## Frontmatter Fields

### Required

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `applyTo` | String | Glob pattern(s) for file matching | `'packages/atomic/**'` |

### Optional

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | String | Brief summary of instruction scope | `'TypeScript conventions'` |

## Glob Pattern Syntax

Instructions use glob patterns to determine when they apply:

| Pattern | Matches |
|---------|---------|
| `**` | All files in workspace |
| `packages/atomic/**` | All files in atomic package |
| `**/*.ts` | All TypeScript files |
| `**/*.{ts,tsx}` | TypeScript and TSX files |
| `**/*.spec.ts` | All test files |
| `**/components/**/*.tsx` | Component files in any components directory |

### Pattern Specificity

When multiple instructions match a file, **all matching instructions are combined**. More specific patterns don't override less specific ones—they all apply together.

**Example:** For `packages/atomic/src/components/search/atomic-search-box.spec.ts`:
- ✅ `general.instructions.md` (`**`) - Applies
- ✅ `general.typescript.instructions.md` (`**/*.ts`) - Applies
- ✅ `atomic.instructions.md` (`packages/atomic/**`) - Applies
- ✅ `tests-atomic.instructions.md` (`**/atomic/**/*.spec.ts`) - Applies

**All four instructions combine automatically.**

## Instruction Hierarchy

To help AI resolve conflicts when instructions contradict each other, document the precedence order:

```markdown
## Instruction Hierarchy

When instructions conflict, apply this precedence order:

1. Workspace prompts (e.g., `workspace-prompts.instructions.md`)
2. Package-specific (e.g., `atomic.instructions.md`)
3. File-type specific (e.g., `general.typescript.instructions.md`)
4. General (this file)
5. Language/framework defaults
```

## Content Guidelines

### Auto-Applied Nature

Instructions are **passive** - they influence AI behavior without user invocation.

**Key characteristics:**
- ✅ Automatically applied when file pattern matches
- ✅ Combined with other matching instructions
- ✅ No user action required
- ✅ Can reference other files/URLs with Markdown links

### Effective Instruction Content

**DO:**
- Start with the most critical rule
- Use specific, actionable language
- Include concrete code examples
- Group related rules under clear headings
- Reference specific files when needed: `[Design System](../docs/design-system.md)`

**DON'T:**
- Use vague guidance ("appropriate", "good practice")
- Repeat content from other instructions (reference them instead)
- Create overly broad patterns that conflict with specific ones
- Write generic advice available in language docs

### Content Organization

```markdown
---
applyTo: 'pattern'
---

## [Primary Rule or Context]

[Most critical information first - what's the #1 thing?]

## [Topic 1]

[Specific guidance with examples]

### Subtopic

[Drill down when needed]

## [Topic 2]

[Specific guidance with examples]

## Examples

[Concrete code examples]

## Anti-Patterns

[What NOT to do - optional]
```

## References

- **Official VS Code Docs:** https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- **Markdown Link Syntax:** `[link text](path/to/file.md)` for workspace files
- **External URLs:** `[link text](https://example.com)` for external references
