---
name: creating-prompts
description: Creates VS Code Copilot reusable prompts for on-demand workflows. Use when building repeatable tasks users trigger manually - can be simple templates or complex multi-step processes.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
---

# Creating Prompts

## Process

### Step 1: Plan the Prompt

Before creating, answer:

1. What specific task does this prompt accomplish?
2. Will this task be repeated by multiple people?
3. Does it need scripts/assets, or is it instruction-based?
4. What is the clearest kebab-case name? (e.g., `migrate-stencil-to-lit`, `generate-vitest-tests`)

**Decision:**
- Needs scripts/assets → Create a skill instead
- Fully autonomous → Create an agent instead
- User-invoked workflow → Create a prompt

### Step 2: Initialize

```bash
node .github/skills/creating-prompts/scripts/init_prompt.mjs {name}
```

Creates: `.github/prompts/{name}.prompt.md` with template structure.

### Step 3: Complete the Prompt

Fill in the generated file:
1. Set `agent` (usually `'agent'` for ui-kit)
2. Set `tools` (common: `['codebase', 'editFiles', 'search']`)
3. Write role definition (specific expertise)
4. Add task description with `{{placeholders}}`
5. List numbered requirements (specific, actionable)
6. Include validation checklist

For format details, see [SPECIFICATION.md](references/SPECIFICATION.md).
For writing guidance, see [best-practices.md](references/best-practices.md).
For examples, see [ui-kit-templates.md](references/ui-kit-templates.md).

### Step 4: Validate

```bash
node .github/skills/creating-prompts/scripts/validate_prompt.mjs .github/prompts/{name}.prompt.md
```

### Step 5: Test with Real Use Case

1. Invoke the prompt in VS Code Copilot
2. Provide test input with real values for placeholders
3. Review output quality against requirements
4. Refine prompt based on gaps or errors

## Modifying Existing Prompts

**Extending:**
1. Read existing prompt to understand scope
2. Add new requirements or validation checks
3. Run validation, test with use cases

**Renaming:**
1. Create new file with new name
2. Copy content, update internal references
3. Search for references: `grep -r "{old-name}" .github/`
4. Update references, delete old file

**Deprecating:**
1. Add to description: "(Deprecated: use `replacement-prompt` instead)"
2. Keep functional until dependents migrate
3. Delete after confirming no references

## Reference Documentation

| Reference | When to Load |
|-----------|--------------|
| [SPECIFICATION.md](references/SPECIFICATION.md) | Frontmatter fields, variables, tool references |
| [best-practices.md](references/best-practices.md) | Writing effective prompts, structure patterns |
| [workflows.md](references/workflows.md) | Multi-step process patterns |
| [ui-kit-templates.md](references/ui-kit-templates.md) | ui-kit specific examples |

## Scripts

| Script | Purpose |
|--------|---------|
| `init_prompt.mjs` | Initialize with template |
| `validate_prompt.mjs` | Validate structure and frontmatter |
