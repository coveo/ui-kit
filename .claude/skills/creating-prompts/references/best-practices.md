# Prompt Authoring Best Practices

> Adapted from Claude's best practices and tailored for VS Code Copilot prompts in ui-kit

## Core Principles

### Write for AI agents, not humans

Prompts are consumed by AI models. Focus on clarity, actionability, and explicit guidance over prose style.

### Be explicit about expectations

Modern AI models respond well to clear, explicit instructions. If you want comprehensive behavior, request it explicitly.

```markdown
# Less effective
Create a component.

# More effective
Create a Lit web component following the Atomic naming convention (atomic-{name}), with Shadow DOM, Tailwind styles, WCAG 2.2 AA accessibility compliance, JSDoc documentation, and comprehensive unit tests.
```

### Provide context and motivation

Explaining *why* behind instructions helps models understand goals and deliver better results.

```markdown
# Less effective
Use kebab-case for component names.

# More effective
Use kebab-case for component names (e.g., `atomic-search-box`). This matches the web component custom element naming convention and ensures consistency across the Atomic library.
```

### Tell what TO DO, not what NOT to do

Positive framing is more effective than negative constraints.

```markdown
# Less effective
Do not use Stencil decorators.

# More effective
Use Lit decorators (@customElement, @property, @state) for all new components.
```

## Prompt Structure

### The Standard Pattern: Role + Context + Task + Format

This structure provides clear guidance and sets expectations:

```markdown
# [Task Title]

You are [specific role] for the Coveo ui-kit monorepo.

## Context

- Repository: coveo/ui-kit
- Package: [target package]
- Tech: [technology stack]
- Standards: [instruction files]

## Task

[Clear description with {{placeholders}}]

## Requirements

1. [Specific requirement]
2. [Another requirement]
3. [Third requirement]

## Output Format

[Expected structure]

## Validation

Before completing, verify:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

### Role Definition

Start with a specific, relevant role:

**Good examples:**
```markdown
You are an expert in migrating Coveo Atomic components from Stencil to Lit.
You are a technical writer specializing in web component documentation.
You are a testing engineer focused on Vitest and Playwright for UI components.
```

**Avoid generic roles:**
```markdown
You are a helpful assistant.
You are an AI that helps with code.
```

### Context Section

Include repository-specific information:

```markdown
## Context

- Repository: coveo/ui-kit monorepo
- Package: packages/atomic (Lit + Tailwind)
- Testing: Vitest (unit), Playwright (E2E)
- Standards:
  - `.github/instructions/atomic.instructions.md`
  - `.github/instructions/tests-atomic.instructions.md`
```

## Writing Effective Requirements

### Use numbered lists for sequential steps

```markdown
## Requirements

1. Read the existing Stencil component
2. Create new Lit component with same functionality
3. Migrate styles to Tailwind CSS
4. Update imports to use @/* path aliases
5. Create comprehensive test coverage
```

### Include concrete criteria

```markdown
# Vague
Write good tests.

# Specific
Write Vitest unit tests with:
- One behavior per test case
- Descriptive names starting with "should"
- renderComponent() helper function
- Proper mocking using buildFake* utilities
```

### Reference instruction files

```markdown
## Requirements

Follow conventions in:
- `.github/instructions/atomic.instructions.md` - Component structure
- `.github/instructions/tests-atomic.instructions.md` - Testing patterns

When instructions conflict, follow this hierarchy:
Package-specific > File-type specific > General
```

## Validation Checklists

### Always include verification steps

```markdown
## Validation

Before completing, verify:
- [ ] All tests pass: `pnpm test`
- [ ] Linting passes: `pnpm lint:fix`
- [ ] TypeScript compiles: `pnpm build`
- [ ] Accessibility maintained (WCAG 2.2 AA)
- [ ] Documentation updated
```

### Make checks executable

Reference specific commands when possible:

```markdown
- [ ] Run tests: `cd packages/atomic && pnpm test atomic-component-name`
- [ ] Check accessibility: Verify with screen reader
- [ ] Validate HTML: Check shadow parts structure
```

### Include quality gates

```markdown
## Validation

Do not consider the task complete until ALL of these pass:
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Linting passes
- [ ] No TypeScript `any` types without justification
- [ ] JSDoc complete for all public APIs
```

## Using Placeholders

### Placeholder syntax

Use `{{variable-name}}` for user-provided values:

```markdown
## Task

Migrate the component `{{component-name}}` from Stencil to Lit.

## Files

- Source: `packages/atomic/src/components/{{folder}}/{{component-name}}/`
- Tests: `{{component-name}}.spec.ts`
```

### Placeholder naming

```markdown
# Good - kebab-case, descriptive
{{component-name}}
{{target-folder}}
{{test-type}}

# Avoid - unclear or inconsistent
{{name}}
{{folder}}
{{componentName}}
```

### Document expected values

```markdown
## Input Variables

This prompt requires:
- `{{component-name}}` - Component name in kebab-case (e.g., `search-box`)
- `{{folder}}` - Target folder: `common`, `search`, `commerce`, or `insight`
- `{{include-tests}}` - Whether to generate tests: `yes` or `no`
```

## Constraint Patterns

### Positive constraints (preferred)

Frame as what to do:

```markdown
## Component Standards

- Use Lit decorators (@customElement, @property, @state)
- Apply Tailwind CSS via the tw helper
- Use @/* path aliases for imports outside current directory
- Include JSDoc on all public properties
- Follow atomic-{name} naming convention
```

### Negative constraints (when necessary)

Use sparingly for critical prohibitions:

```markdown
## Critical Constraints

DO NOT:
- Use Stencil decorators in new components
- Skip accessibility attributes (aria-*, role)
- Use relative imports for cross-directory references
- Commit code with `any` types without justification comments
```

### Conditional behavior

```markdown
## Decision Logic

- **If** the component is interactive → include keyboard navigation tests
- **If** the component has slots → document slot usage in JSDoc
- **If** migrating from Stencil → preserve all existing behavior exactly
- **Otherwise** → follow default Atomic component patterns
```

## Examples and Demonstrations

### Use examples sparingly

Examples are powerful but taken literally. Ensure they match desired patterns exactly.

```markdown
## Example Component Structure

```typescript
import {customElement, property, state} from 'lit/decorators.js';
import {LitElement, html} from 'lit';
import {tw} from '@/utils/tailwind';

@customElement('atomic-example')
export class AtomicExample extends LitElement {
  @property({type: String}) label = 'Default';
  @state() private isActive = false;

  render() {
    return html`
      <button class=${tw('px-4 py-2 bg-blue-500')}>
        ${this.label}
      </button>
    `;
  }
}
```
\`\`\`

Follow this exact structure for new components.
```

### Provide edge cases when relevant

```markdown
## Edge Cases

- **Empty results:** Show "No results found" message
- **Network error:** Display error state with retry button
- **Missing required prop:** Log warning and use default value
- **Slot content not provided:** Render default placeholder
```

## Format Control

### Match prompt style to output style

The formatting in your prompt influences response style. For technical docs with flowing prose, use less fragmented markdown.

### Use markdown strategically

```markdown
# Appropriate markdown use

- `inline code` for technical terms and values
- Code blocks for implementations
- Headings for organization
- Tables for structured data

Avoid excessive bullet points - incorporate information into flowing paragraphs when describing concepts.
```

## Integration with ui-kit

### Always reference instruction files

```markdown
## Standards

Follow these instruction files:
- `.github/instructions/atomic.instructions.md` - Component conventions
- `.github/instructions/tests-atomic.instructions.md` - Testing patterns
- `.github/instructions/general.typescript.instructions.md` - TypeScript rules
```

### Package-aware prompts

```markdown
## Package Context

Identify the target package:

| Package | Tech | Tests |
|---------|------|-------|
| atomic | Lit + Tailwind | Vitest + Playwright |
| headless | TypeScript | Vitest |
| quantic | LWC | Jest + Cypress |

Load appropriate instruction files based on target.
```

### Leverage existing patterns

```markdown
## Pattern Reference

Use the component generation script as a starting point:
```bash
node scripts/generate-component.mjs {{component-name}} src/components/{{folder}}
```

This creates the recommended file structure and boilerplate.
```

## Common Anti-Patterns

### ❌ Vague instructions

```markdown
# Bad
Make a good component.

# Good
Create a Lit web component following Atomic conventions with Shadow DOM, Tailwind styles, WCAG 2.2 AA accessibility, and comprehensive documentation.
```

### ❌ Missing output specification

```markdown
# Bad
Generate tests.

# Good
Generate a Vitest unit test file (*.spec.ts) with:
- renderComponent() helper
- describe blocks for each condition
- it() statements starting with "should"
- One assertion per test
```

### ❌ No validation criteria

```markdown
# Bad
Write the code.

# Good
Write the code, then verify:
- [ ] pnpm lint:fix passes
- [ ] pnpm test passes
- [ ] No TypeScript errors
- [ ] Accessibility validated
```

### ❌ Overemphasis

Avoid excessive "CRITICAL", "MUST", "ALWAYS" - save emphasis for truly critical constraints.

```markdown
# Overemphasized
CRITICAL: You MUST ALWAYS use this pattern WITHOUT EXCEPTION.

# Appropriate
Use this pattern for new components.

# When emphasis needed
CRITICAL: Do not commit credentials or API keys to the repository.
```

### ❌ Assuming context

Don't assume the AI knows ui-kit specifics:

```markdown
# Bad
Follow our conventions.

# Good
Follow conventions in `.github/instructions/atomic.instructions.md`:
- Component naming: atomic-{name}
- Styling: Tailwind CSS via tw helper
- Testing: Vitest for unit tests
```

## Testing Your Prompts

### Iterate with real use cases

1. Write the prompt
2. Test with a representative example
3. Review the output quality
4. Refine based on gaps or errors
5. Repeat until output meets standards

### Check for completeness

Does the prompt provide enough guidance to:
- Understand the goal?
- Know what tools/patterns to use?
- Validate the result?
- Handle common edge cases?

### Verify instruction file references

Ensure referenced instruction files exist and contain relevant guidance:

```bash
ls -la .github/instructions/atomic.instructions.md
```

## Prompt Complexity

**Prompts can be simple or complex:**
- Simple: Single-step tasks, straightforward transformations
- Complex: Multi-step workflows, sophisticated refactoring, guided processes

**No hard line limit** - prompts can be as detailed as needed for the task.

**When to convert to a skill:**
- Needs **executable scripts** (not just instructions)
- Requires **multiple reference documents**
- Includes **templates or assets**
- Benefits from **agent discovery** (not manual invocation)

**Key distinction:** Prompts are user-invoked. Skills are agent-discoverable with resources.

See `.github/skills/creating-skills/` for skill creation guidance.

---

*These practices ensure prompts are clear, actionable, and aligned with ui-kit standards.*
