# Instruction Naming Conventions

## File Naming Pattern

```
{scope}.instructions.md
```

## Scope Types

### Package-Specific

Name after the package:
- `atomic.instructions.md` → Atomic package conventions
- `headless.instructions.md` → Headless package conventions
- `quantic.instructions.md` → Quantic package conventions

### File-Type Specific

Use `{general|package}.{type}.instructions.md`:
- `general.typescript.instructions.md` → All TypeScript files
- `atomic.stories.instructions.md` → Atomic Storybook files

### Test Conventions

Use `tests-{package}.instructions.md`:
- `tests-atomic.instructions.md` → Atomic test patterns
- `tests-headless.instructions.md` → Headless test patterns

### Technology-Specific

Name after the technology:
- `msw-api-mocking.instructions.md` → MSW patterns
- `playwright-typescript.instructions.md` → Playwright patterns

### Cross-Cutting Concerns

Use descriptive names:
- `atomic.instructions.md` → Atomic package conventions
- `general.instructions.md` → Universal principles

## applyTo Patterns

### Common Patterns

| Pattern | Matches |
|---------|---------|
| `packages/atomic/**` | All files in atomic |
| `**/*.ts, **/*.tsx` | All TypeScript |
| `**/*.spec.ts` | All unit tests |
| `**/*.e2e.ts` | All E2E tests |
| `**/*.stories.tsx` | All Storybook stories |
| `**/components/**/*.ts` | Component files |

### Pattern Specificity

More specific patterns take precedence:
1. `packages/atomic/src/components/search/**/*.spec.ts` (most specific)
2. `packages/atomic/**/*.spec.ts`
3. `**/*.spec.ts`
4. `**` (least specific)

## Avoiding Conflicts

### Check Before Creating

```bash
# List existing instructions and their scopes
for f in .github/instructions/*.instructions.md; do
  echo "=== $f ==="
  head -5 "$f" | grep applyTo
done
```

### Document Hierarchy

When your instruction might conflict with others, add:

```markdown
## Instruction Hierarchy

When instructions conflict, this file takes precedence over:
- `general.instructions.md` (general rules)

But yields to:
- `tests-atomic.instructions.md` (more specific)
```
