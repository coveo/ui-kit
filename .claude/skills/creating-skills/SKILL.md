---
name: creating-skills
description: Creates, validates, and packages Agent Skills following the open standard (agentskills.io). Portable across multiple AI agents. Use when building agent-discoverable capabilities with scripts, references, or assets.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
  package: all
---

# Creating Skills

## Process

### Step 1: Plan the Skill

Before creating, answer:

1. What specific task does this skill accomplish?
2. What triggers should activate this skill?
3. What reusable resources would help (scripts, references, assets)?
4. What is the best gerund-form name? (e.g., `generating-tests`, `migrating-components`)

### Step 2: Initialize

```bash
node .github/skills/creating-skills/scripts/init_skill.mjs <skill-name> --path .github/skills
```

Creates: `SKILL.md` template, `scripts/`, `references/`, `assets/` directories.

### Step 3: Complete the Skill

1. **Set `name`** - Must match folder name, use gerund form
2. **Write `description`** - Third person, include what AND when to use
3. **Write instructions** - Keep under 500 lines, use concrete examples
4. **Add resources** - Scripts for deterministic tasks, references for detailed docs

For format details, see [SPECIFICATION.md](references/SPECIFICATION.md).
For writing guidance, see [best-practices.md](references/best-practices.md).

### Step 4: Validate

```bash
node .github/skills/creating-skills/scripts/quick_validate.mjs .github/skills/<skill-name>
```

### Step 5: Package (Optional)

```bash
node .github/skills/creating-skills/scripts/package_skill.mjs .github/skills/<skill-name>
```

## Converting Prompts to Skills

1. Identify reusable logic and determine gerund-form name
2. Initialize: `node .github/skills/creating-skills/scripts/init_skill.mjs <name> --path .github/skills`
3. Move prompt content to `SKILL.md`, rewrite description in third person
4. Extract code examples to `scripts/`, detailed docs to `references/`
5. Validate, then deprecate original prompt

## Modifying Existing Skills

**Extending a skill:**
1. Read existing `SKILL.md` and references to understand current scope
2. Add new sections/steps without removing existing functionality
3. Update description if scope expanded significantly
4. Run validation, test with representative use cases

**Renaming a skill:**
1. Create new directory with new name
2. Move all files, update `name` field in frontmatter
3. Search for references: `grep -r "old-skill-name" .github/`
4. Update all references, delete old directory

**Deprecating a skill:**
1. Add to description: "(Deprecated: use `replacement-skill` instead)"
2. Keep functional until dependents migrate
3. Delete only after confirming no references remain

## Reference Documentation

| Reference | When to Load |
|-----------|--------------|
| [SPECIFICATION.md](references/SPECIFICATION.md) | Format details, field constraints, validation rules |
| [best-practices.md](references/best-practices.md) | Writing guidance, naming, descriptions, patterns |
| [workflows.md](references/workflows.md) | Multi-step process patterns |
| [output-patterns.md](references/output-patterns.md) | Templates for consistent output |

## Scripts

| Script | Purpose |
|--------|---------|
| `init_skill.mjs` | Initialize new skill with template |
| `quick_validate.mjs` | Validate skill structure per spec |
| `package_skill.mjs` | Package for distribution (.skill) |

## ui-kit Notes

**Naming pattern:** `generating-*`, `migrating-*`, `validating-*`, `documenting-*`

**Integration:**
- Skills reference `.github/instructions/` for context
- Agents in `.github/agents/` compose skills
- Prompts in `.github/prompts/` should migrate to skills

## Validation Checklist

- [ ] `name` matches folder, uses gerund form
- [ ] `description` explains what AND when (third person)
- [ ] `SKILL.md` under 500 lines
- [ ] References linked one level deep
- [ ] Scripts tested and executable
