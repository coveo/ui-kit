# VS Code Copilot Prompt Specification

This document defines the format and requirements for reusable prompts in `.github/prompts/`.

## File Structure

A prompt is a single Markdown file with YAML frontmatter:

```
.github/prompts/
└── task-name.prompt.md    # kebab-case naming
```

## File Format

### Frontmatter (Required)

```yaml
---
agent: 'agent'
tools: ['codebase', 'editFiles', 'search']
description: 'Optional description shown in UI'
---
```

### Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `agent` | Yes | Which agent to use | `'ask'`, `'agent'`, `'edit'`, or custom agent name |
| `model` | Optional | Specific model to use | `'GPT-4o'`, `'Claude Sonnet 4'` |
| `tools` | Yes | Available tools list | `['codebase', 'editFiles']` |
| `description` | Optional | UI description | `Migrate Stencil to Lit` |

### Agent Options

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `'agent'` | Full agent with tool access | Complex tasks, file modifications, searches |
| `'edit'` | Edit existing content | Simple text transformations, refactoring |
| `'ask'` | Chat/question answering | Informational queries, explanations |

**Default:** Use `'agent'` for most ui-kit prompts unless the task is purely text transformation.

### Agent Field Examples

Specify which agent should handle the prompt:

```yaml
agent: 'ask'    # Chat agent for questions/explanations
agent: 'agent'  # Workspace agent (recommended for ui-kit)
agent: 'edit'   # Edit agent for text transformations
agent: 'custom-agent-name'  # Specific custom agent
```

### Model Field

Request a specific model for the task:

```yaml
model: 'GPT-4o'           # OpenAI GPT-4o
model: 'Claude Sonnet 4'  # Anthropic Claude Sonnet
model: 'o1'               # OpenAI o1 (reasoning model)
```

**When to specify:**
- Complex refactoring → GPT-4o or Claude Sonnet 4
- Reasoning-heavy tasks → o1
- Default (most cases) → Omit to use user's default

### Available Tools

Common tool combinations:

```yaml
# Reading and searching
tools: ['codebase', 'search']

# Modifying files
tools: ['codebase', 'editFiles', 'search']

# Full development workflow
tools: ['codebase', 'editFiles', 'search', 'runCommands', 'new']

# Problem diagnosis
tools: ['codebase', 'search', 'problems']
```

**Tool reference:**
- `codebase` - Search and understand code structure
- `search` - Search files and content
- `editFiles` / `edit/editFiles` - Modify existing files
- `new` - Create new files
- `runCommands` - Execute shell commands
- `problems` - Access diagnostic information

## Body Structure

### Recommended Sections

```markdown
# Task Title

Brief description of what this prompt does.

## Context

- Repository: coveo/ui-kit
- Package: [target package]
- Relevant standards: [instruction files]

## Task

[What to accomplish - use {{placeholder}} for variables]

## Requirements

1. Specific requirement with concrete criteria
2. Another requirement
3. Third requirement

## Output Format

[Expected output structure or file organization]

## Validation

Before completing, verify:
- [ ] Specific check 1
- [ ] Specific check 2
- [ ] Specific check 3
```

### Optional Sections

```markdown
## Examples

[Concrete examples of inputs and expected outputs]

## Edge Cases

[Known edge cases and how to handle them]

## References

[Links to related documentation or instruction files]
```

## Naming Conventions

### File Names

Use kebab-case, descriptive of the task:

**Good examples:**
- `migrate-stencil-to-lit.prompt.md`
- `generate-vitest-tests.prompt.md`
- `write-component-documentation.prompt.md`
- `create-accessibility-audit.prompt.md`

**Avoid:**
- `component.prompt.md` (too vague)
- `helper.prompt.md` (unclear purpose)
- `migrate_component.prompt.md` (use hyphens, not underscores)
- `MigrateComponent.prompt.md` (use lowercase)

### Task Titles

Use action-oriented, descriptive titles:

```markdown
# Migrate Stencil Component to Lit
# Generate Vitest Unit Tests
# Write MDX Component Documentation
# Create Playwright E2E Tests
```

## Variables and References

### Placeholders

Use `{{variable-name}}` or `${variableName}` syntax for user-provided values:

```markdown
## Task

Migrate the component `{{component-name}}` from Stencil to Lit.

Current file: ${file}
Selected text: ${selection}
```

**Built-in variables:**
- `${file}` - Current file path
- `${selection}` - Currently selected text
- `${variableName}` - Custom variables (user will be prompted)

**Custom placeholders:**
- Use kebab-case: `{{component-name}}`, not `{{componentName}}`
- Be descriptive: `{{target-folder}}`, not `{{folder}}`
- Match ui-kit conventions: `{{component-name}}` for atomic components

### Tool References

Reference external tools with `#tool:` syntax:

```markdown
## Context

Use templates from #tool:githubRepo coveo/ui-kit-templates

Search the codebase with #tool:search/codebase for similar patterns.
```

**Available tool references:**
- `#tool:githubRepo org/repo` - Reference GitHub repository
- `#tool:search/codebase` - Search workspace codebase
- `#tool:search` - General search

## Workspace File References

Reference workspace files and external resources with Markdown links:

```markdown
## Context

Follow conventions in:
- [Atomic component structure](../.github/instructions/atomic.instructions.md)
- [Testing patterns](../.github/instructions/tests-atomic.instructions.md)
- [Design system forms](../docs/design-system/Form.md)

External reference: [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
```

**Benefits:**
- AI can fetch and understand referenced content
- Reduces prompt duplication
- Keeps prompts focused

**Instruction hierarchy (when conflicts occur):**
1. Package-specific (e.g., `atomic.instructions.md`)
2. File-type specific (e.g., `tests-atomic.instructions.md`)
3. General (e.g., `general.typescript.instructions.md`)

## Role Definition

Start prompts with role definition for better context:

```markdown
You are an expert in [specific domain] for the Coveo ui-kit monorepo.
```

**Good examples:**
```markdown
You are an expert in migrating Coveo Atomic components from Stencil to Lit.
You are a technical writer specializing in web component documentation.
You are a testing engineer focused on Vitest and Playwright.
```

**Avoid generic roles:**
```markdown
You are a helpful assistant.
You are an AI that helps with code.
```

## Validation Checklists

Always include verification steps:

```markdown
## Validation

Before completing, verify:
- [ ] All tests pass: `pnpm test`
- [ ] Linting passes: `pnpm lint:fix`
- [ ] TypeScript compiles without errors
- [ ] Accessibility maintained (WCAG 2.2 AA)
- [ ] Documentation updated
```

**Make checks executable:** Reference specific commands when possible.

## Constraints

### Positive Constraints (Preferred)

Frame as what TO DO:

```markdown
## Requirements

1. Use Lit decorators (@customElement, @property, @state)
2. Apply Tailwind CSS via the tw helper
3. Use @/* path aliases for imports
4. Include JSDoc on all public properties
```

### Negative Constraints (When Necessary)

Use sparingly for critical prohibitions:

```markdown
## Requirements

DO NOT:
- Use Stencil decorators in new code
- Skip accessibility attributes
- Use relative imports for cross-directory references
```

## Prompt Complexity

**Prompts can be simple or complex:**
- Simple prompts: Single-step tasks, straightforward transformations
- Complex prompts: Multi-step workflows, sophisticated refactoring, guided processes

**No hard line limit** - prompts can be as detailed as needed for the task.

**Consider converting to a skill if:**
- Task requires scripts or executables (not just instructions)
- Need separate reference documentation files
- Includes assets like templates or schemas
- Task benefits from agent discovery (not manual invocation)

## When NOT to Use Prompts

Create a skill instead if:
- Task requires scripts or executables
- Need reference documentation exceeding prompt size
- Task involves complex multi-step workflows
- Assets like templates or schemas are needed

See `.github/skills/creating-skills/` for skill creation.

## Validation

Validate prompts using:

```bash
node .github/skills/creating-prompts/scripts/validate_prompt.mjs .github/prompts/{name}.prompt.md
```

**Validation checks:**
- [ ] File ends with `.prompt.md`
- [ ] Valid YAML frontmatter
- [ ] Required fields present (`agent`, `tools`)
- [ ] Kebab-case file naming
- [ ] Clear task description
- [ ] Validation checklist included
- [ ] Relevant instruction files referenced

---

*This specification follows patterns established by the Agent Skills standard (agentskills.io) adapted for VS Code Copilot prompts.*
