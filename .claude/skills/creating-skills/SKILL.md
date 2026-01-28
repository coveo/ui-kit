---
name: creating-skills
description: Creates, validates, and packages Agent Skills following the open standard (agentskills.io). Portable across multiple AI agents. Use when building agent-discoverable capabilities with scripts, references, or assets.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
---

# Creating Skills

## Skill Location

Skills following the [Agent Skills open standard](https://agentskills.io) can be stored in multiple locations:

- **`.claude/skills/`** - Workspace-level (recommended for local development, maximum compatibility)
- **`.skills/`** or `skills/`** - Alternative workspace conventions
- **`~/.claude/skills/`** - User-level personal skills

This skill recommends `.claude/skills/` for workspace development as it's compatible with multiple AI tools (GitHub Copilot, Claude Code, OpenCode, etc.).

## Process

### Step 1: Plan the Skill

Before creating, answer:

1. What specific task does this skill accomplish?
2. What triggers should activate this skill?
3. What reusable resources would help (scripts, references, assets)?
4. What is the best gerund-form name? (e.g., `generating-tests`, `migrating-components`)

### Step 2: Initialize

```bash
node <skills-dir>/creating-skills/scripts/init_skill.mjs <skill-name> --path <skills-dir>
```

Default `<skills-dir>` is `.claude/skills` (workspace-level). Other common locations: `.skills`, `skills/`, `~/.claude/skills` (user-level).

Creates: `SKILL.md` template, `scripts/`, `references/`, `assets/` directories.

### Step 3: Complete the Skill

1. **Set `name`** - Must match folder name, use gerund form
2. **Write `description`** - Third person, include what AND when to use
3. **Write instructions** - Keep under 500 lines, use concrete examples
4. **Add resources** - Scripts for deterministic tasks, references for detailed docs

For format details, see [SPECIFICATION.md](references/SPECIFICATION.md).
For writing guidance, see [best-practices.md](references/best-practices.md).

### Step 4: Clean Up

Remove unused placeholder files and directories created during initialization:

```bash
# Remove .gitkeep files from unused directories
find <skills-dir>/<skill-name> -name '.gitkeep' -delete

# Remove empty directories
find <skills-dir>/<skill-name> -type d -empty -delete
```

**The skill should only contain directories with actual content.** If you didn't add scripts, the `scripts/` directory should not exist. Same for `assets/` and unused subdirectories.

### Step 5: Validate

```bash
node <skills-dir>/creating-skills/scripts/quick_validate.mjs <skills-dir>/<skill-name>
```

### Step 6: Package (Optional)

```bash
node <skills-dir>/creating-skills/scripts/package_skill.mjs <skills-dir>/<skill-name>
```

Produces a `.skill` archive (tar.gz) for distribution.

## Converting Prompts to Skills

1. Identify reusable logic and determine gerund-form name
2. Initialize: `node <skills-dir>/creating-skills/scripts/init_skill.mjs <name> --path <skills-dir>`
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
3. Search for references in your workspace (e.g., `grep -r "old-skill-name"`)
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
- Skills stored in `.claude/skills/` (workspace-level, compatible with all AI tools)
- Skills reference workspace instructions for context
- Agents compose skills for complex workflows
- Prompts should migrate to skills for better portability

## Validation Checklist

- [ ] `name` matches folder, uses gerund form
- [ ] `description` explains what AND when (third person)
- [ ] `SKILL.md` under 500 lines
- [ ] References linked one level deep
- [ ] Scripts tested and executable
- [ ] All `.gitkeep` files removed
- [ ] No empty directories remain
