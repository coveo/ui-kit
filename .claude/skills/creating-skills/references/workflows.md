# Workflow Patterns

When a skill involves multi-step processes, use these patterns.

## Pattern 1: Sequential Steps

Number steps clearly. Each step should be independently actionable.

<example name="migration-workflow">
## Migration Process

1. **Analyze** - Identify decorators, lifecycle methods, dependencies
   Run: `grep -E "@(Prop|State|Event)" src/components/example/example.tsx`

2. **Scaffold** - Generate Lit component structure
   Run: `node scripts/generate-component.mjs example-name src/components/search`

3. **Transform** - Convert Stencil patterns to Lit
   - `@Prop()` → `@property()`
   - `@State()` → `@state()`
   - `componentDidLoad` → `firstUpdated`

4. **Validate** - Verify the migration
   Run: `pnpm build && pnpm test`
</example>

**When to use:** Linear processes where each step depends on the previous.

## Pattern 2: Decision Tree

Use ASCII trees for branching logic. Keep to 2-3 levels max.

<example name="component-decision">
## Choosing an Approach

```
What exists?
├─ Stencil component (.tsx)
│   ├─ Has tests → Migrate tests alongside
│   └─ No tests → Create tests after migration
│
└─ Lit component (.ts)
    ├─ Missing stories → Add Storybook coverage
    └─ Has stories → Update with MSW mocks
```
</example>

**When to use:** Mutually exclusive paths based on conditions.

## Pattern 3: Checkpoints

Add validation between major phases to catch errors early.

<example name="checkpoint">
### After Step 3: Transform

**Checkpoint** - Before proceeding, verify:
- [ ] No Stencil imports remain
- [ ] TypeScript compiles: `pnpm build`
- [ ] Component renders: check Storybook

**If build fails:** See Troubleshooting section.
</example>

**When to use:** Complex workflows where errors compound.

## Pattern 4: Troubleshooting

Pair symptoms with causes and fixes.

<example name="troubleshooting">
## Troubleshooting

**Build fails after decorator transformation**
- Cause: Lit decorators require initializers
- Fix: Add default values (`items: Item[] = []`)

**Tests fail with "Element not found"**
- Cause: Different rendering timing in Lit
- Fix: Add `await element.updateComplete` before assertions
</example>

**When to use:** Workflows with common failure modes.

## Choosing a Pattern

| Workflow Type | Pattern | Example |
|---------------|---------|---------|
| Linear process | Sequential | Migration, setup |
| Branching logic | Decision Tree | Component type selection |
| Error-prone steps | Checkpoints | Multi-file refactoring |
| Known failure modes | Troubleshooting | Build/test issues |
