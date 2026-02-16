# Workflow Patterns for Prompts

When a prompt involves multi-step processes, use these patterns to structure instructions clearly.

## Pattern 1: Sequential Steps

Number steps clearly when the order matters. Each step should be actionable.

```markdown
## Process

1. **Read existing component** - Load the Stencil component and understand its structure
   - Location: `packages/atomic/src/components/{{folder}}/{{component-name}}/`
   - Focus on: decorators, lifecycle methods, dependencies

2. **Generate Lit scaffold** - Create the new component structure
   ```bash
   node scripts/generate-component.mjs {{component-name}} src/components/{{folder}}
   ```

3. **Migrate implementation** - Convert Stencil patterns to Lit
   - `@Prop()` → `@property()`
   - `@State()` → `@state()`
   - `componentDidLoad()` → `firstUpdated()`

4. **Update tests** - Create Vitest unit tests
   - Follow `.github/instructions/tests-atomic.instructions.md`

5. **Validate** - Ensure everything works
   ```bash
   pnpm test && pnpm lint:fix
   ```
```

**When to use:** Linear processes where each step depends on the previous.

## Pattern 2: Decision Trees

Use conditional logic for branching workflows:

```markdown
## Approach

Determine the starting point:

- **If** Stencil component exists:
  1. Read existing implementation
  2. Migrate to Lit preserving all behavior
  3. Create tests matching old functionality

- **If** starting from scratch:
  1. Generate component using script
  2. Implement according to requirements
  3. Create comprehensive tests

- **If** Lit component exists but needs updates:
  1. Read existing component
  2. Identify what needs to change
  3. Make minimal modifications
  4. Update tests accordingly
```

**When to use:** Different starting conditions require different paths.

## Pattern 3: Checkpoint Validation

Include validation checkpoints after critical steps:

```markdown
## Process

1. **Scaffold component structure**
   ```bash
   node scripts/generate-component.mjs {{component-name}} src/components/{{folder}}
   ```
   
   **✓ Checkpoint:** Verify these files were created:
   - [ ] `atomic-{{component-name}}.ts`
   - [ ] `atomic-{{component-name}}.tw.css.ts`
   - [ ] `atomic-{{component-name}}.spec.ts`

2. **Implement component logic**
   [implementation steps]
   
   **✓ Checkpoint:** Verify behavior:
   - [ ] Component renders without errors
   - [ ] Props are reactive
   - [ ] Events fire correctly

3. **Add tests**
   [testing steps]
   
   **✓ Checkpoint:** All tests pass:
   ```bash
   pnpm test atomic-{{component-name}}
   ```
```

**When to use:** Long processes where early errors compound.

## Pattern 4: Parallel Tasks

For independent tasks that can happen in any order:

```markdown
## Required Artifacts

Complete all of these (order doesn't matter):

### Unit Tests (`*.spec.ts`)
- Create renderComponent() helper
- Test all public props
- Test controller integration
- Verify accessibility

### E2E Tests (`e2e/*.e2e.ts`)
- Create page object
- Test happy path
- Test accessibility with Playwright

### Documentation (`*.mdx`)
- Document all props in table
- Provide usage examples
- Note accessibility considerations

### Storybook (`*.new.stories.tsx`)
- Create default story
- Add variant stories
- Include interaction tests
```

**When to use:** Multiple deliverables with no dependencies.

## Pattern 5: Iterative Refinement

For tasks requiring multiple passes:

```markdown
## Approach

Iterate until all criteria are met:

### Pass 1: Basic Implementation
1. Create component with core functionality
2. Add minimal styling
3. Verify it renders

### Pass 2: Enhancement
1. Add accessibility attributes (ARIA, roles)
2. Improve keyboard navigation
3. Enhance visual polish

### Pass 3: Testing & Docs
1. Create comprehensive tests
2. Write documentation
3. Add Storybook stories

### Pass 4: Validation
1. Run all checks:
   ```bash
   pnpm lint:fix && pnpm test && pnpm build
   ```
2. Review accessibility
3. Verify against requirements

**Repeat passes until all validation checks pass.**
```

**When to use:** Complex tasks that benefit from layered implementation.

## Pattern 6: Error Recovery

For tasks prone to errors, provide recovery steps:

```markdown
## Process

1. **Migrate component**
   [migration steps]
   
   **If migration fails:**
   - Check for unsupported Stencil patterns
   - Review `.github/instructions/atomic.instructions.md`
   - Consider manual conversion for complex cases

2. **Run tests**
   ```bash
   pnpm test
   ```
   
   **If tests fail:**
   - Review test setup in `beforeEach`
   - Verify mocks are correctly configured
   - Check for missing `await` on async operations
   - See `.github/instructions/tests-atomic.instructions.md`

3. **Lint code**
   ```bash
   pnpm lint:fix
   ```
   
   **If linting fails:**
   - Review error messages for specific issues
   - Check import organization (path aliases)
   - Verify TypeScript types (avoid `any`)
```

**When to use:** Tasks with common failure points that need guidance.

## Combining Patterns

Complex prompts can combine multiple patterns:

```markdown
## Migration Workflow

### Phase 1: Analysis (Sequential)
1. Read Stencil component
2. Identify patterns to migrate
3. Note dependencies

**✓ Checkpoint:** List of decorators, lifecycle methods, deps

### Phase 2: Implementation (Decision Tree)
- **If component is simple:** Direct migration
- **If component is complex:** Migrate in phases
  1. Core functionality first
  2. Advanced features second

### Phase 3: Validation (Parallel Tasks)
Complete all:
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Linting passes
- [ ] Build succeeds

### Phase 4: Refinement (Iterative)
Polish until perfect:
1. Review accessibility
2. Improve documentation
3. Add edge case tests

**Repeat until ready for review.**
```

## Anti-Patterns to Avoid

### ❌ Unclear Step Boundaries

```markdown
# Bad
1. Do the migration and testing and documentation
```

```markdown
# Good
1. Migrate component implementation
2. Create unit tests
3. Write documentation
```

### ❌ Missing Commands

```markdown
# Bad
Run the tests
```

```markdown
# Good
Run the tests:
```bash
cd packages/atomic && pnpm test {{component-name}}
```
\`\`\`
```

### ❌ No Success Criteria

```markdown
# Bad
1. Create tests
2. Move to next step
```

```markdown
# Good
1. Create tests
   
   **✓ Success when:**
   - [ ] All tests pass
   - [ ] Coverage > 80%
   - [ ] No skipped tests
```

---

*These patterns help structure complex, multi-step prompts for clarity and effectiveness.*
