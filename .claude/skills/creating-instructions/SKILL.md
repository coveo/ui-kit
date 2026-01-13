---
name: creating-instructions
description: Create VS Code Copilot custom instruction files for ui-kit. Use when defining coding standards, conventions, or context that should automatically apply to specific file patterns.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
---

# Creating Custom Instructions

## Process

### Step 1: Plan the Instruction

Before creating, check for overlap and determine scope:

```bash
# List existing instructions with patterns
for f in .github/instructions/*.instructions.md; do
  echo "=== $(basename $f) ==="
  grep "applyTo:" "$f"
done
```

Answer:
1. What file pattern(s) should this apply to?
2. Does this overlap with existing instructions?
3. What are the 3-5 most critical rules?

**Decision:**
- Exact match exists → Modify existing (see "Modifying" below)
- Partial overlap → Extend existing OR create with distinct scope
- No overlap → Create new

### Step 2: Initialize

```bash
node .github/skills/creating-instructions/scripts/init_instruction.mjs {name}

# With custom pattern
node .github/skills/creating-instructions/scripts/init_instruction.mjs {name} --apply-to "glob-pattern"
```

Creates: `.github/instructions/{name}.instructions.md` with frontmatter and TODO sections.

**Naming conventions:**

| Scope | Pattern | Example |
|-------|---------|---------|
| Package | `{package}.instructions.md` | `atomic.instructions.md` |
| File type | `general.{type}.instructions.md` | `general.typescript.instructions.md` |
| Tests | `tests-{package}.instructions.md` | `tests-atomic.instructions.md` |
| Technology | `{tech}.instructions.md` | `msw-api-mocking.instructions.md` |

See [naming-conventions.md](references/naming-conventions.md) for details.

### Step 3: Complete the Instruction

Fill in the generated file:
1. Start with the most critical rule
2. Organize by topic with clear headings
3. Provide concrete code examples
4. Reference related files with Markdown links
5. Document hierarchy if conflicts possible

For format details, see [SPECIFICATION.md](references/SPECIFICATION.md).
For writing guidance, see [best-practices.md](references/best-practices.md).
For examples, see [examples.md](references/examples.md).

### Step 4: Validate

```bash
node .github/skills/creating-instructions/scripts/validate_instruction.mjs .github/instructions/{name}.instructions.md
```

**Manual checks:**
- [ ] Most critical rule appears first
- [ ] Concrete examples provided
- [ ] No duplicated content
- [ ] Hierarchy documented if needed

## Modifying Existing Instructions

**Extending:**
1. Read existing file to understand scope
2. Add new sections logically
3. Re-run validation

**Changing scope:**
1. Update `applyTo` frontmatter
2. Check for new conflicts
3. Update hierarchy documentation

**Renaming:**
1. Rename file following conventions
2. Search for references: `grep -r "{old-name}.instructions.md" .github/`
3. Update references
4. Re-validate

**Deprecating:**
1. Verify no active references
2. If merging, copy unique content to target
3. Delete file

## Existing Instructions

| File | Pattern | Purpose |
|------|---------|---------|
| `general.instructions.md` | `**` | Core principles |
| `general.typescript.instructions.md` | `**/*.ts, **/*.tsx` | TypeScript rules |
| `atomic.instructions.md` | `packages/atomic/**` | Atomic conventions |
| `tests-atomic.instructions.md` | `**/atomic/**/*.spec.ts` | Atomic test patterns |
| `playwright-typescript.instructions.md` | `**/*.e2e.ts, **/*.spec.ts` | E2E patterns |
| `msw-api-mocking.instructions.md` | `packages/atomic/**/*.stories.tsx` | Storybook MSW |

**Note:** Accessibility guidelines were moved to the `applying-wcag-guidelines` skill for better discoverability and to avoid context bloat.

**Update this table when creating new instructions.**

## Reference Documentation

| Reference | When to Load |
|-----------|--------------|
| [SPECIFICATION.md](references/SPECIFICATION.md) | VS Code instruction format, frontmatter, patterns |
| [best-practices.md](references/best-practices.md) | Writing effective instructions, terminology |
| [examples.md](references/examples.md) | Real-world instruction examples |
| [naming-conventions.md](references/naming-conventions.md) | File naming patterns |

## Scripts

| Script | Purpose |
|--------|---------|
| `init_instruction.mjs` | Initialize with template |
| `validate_instruction.mjs` | Validate structure per spec |
