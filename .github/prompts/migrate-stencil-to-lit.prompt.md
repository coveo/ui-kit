---
mode: 'agent'
description: 'Migrate an atomic Stencil component to Lit with functional components/utils migration'
---

# Migrate Stencil Component to Lit

Your goal is to migrate an existing atomic Stencil component to a modern Lit-based component while preserving all functionality and maintaining the project's coding standards.

## Migration Requirements

Follow the guidelines from [atomic component instructions](../instructions/atomic.instructions.md) for proper structure and conventions.

### 1. Generate New Lit Component Structure

Use the generate-component.mjs script to create the new Lit component structure:

```bash
cd packages/atomic && node scripts/generate-component.mjs ${input:componentName} ${input:componentDirectory:src/components/common}
```

Ask for the component name (without `atomic-` prefix) and target directory if not provided.

### 2. File Migration Map

Migrate files according to this mapping:

**From Stencil format:**

- `atomic-{name}.tsx` → `atomic-{name}.ts` (main component)
- `atomic-{name}.pcss` → `atomic-{name}.tw.css` (styles)
- Keep unchanged: `.spec.ts`, `.new.stories.tsx`, `.mdx`, `e2e/` files

### 3. Component Code Migration

**Convert Stencil syntax to Lit:**

- Replace `@Component` decorator with Lit `@customElement`
- Convert JSX templates to Lit `html` template literals
- Replace `@Prop()` with `@property()`
- Replace `@State()` with `@state()`
- Replace `@Event()` with custom event dispatching
- Replace `@Listen()` with appropriate event listeners
- Convert lifecycle methods (componentWillLoad → willUpdate, etc.)
- Replace CSS classes with Tailwind CSS utilities

**Style Migration:**

- Convert PostCSS (`.pcss`) to Tailwind CSS (`.tw.css`)
- Replace CSS custom properties with Tailwind utilities where possible
- Maintain design system consistency

### 4. Functional Components/Utils Migration

**For any functional components or utilities used by the component:**

1. **Create Lit versions:**

   - Migrate the functional logic to work with Lit
   - Update imports and usage in the main component
   - Follow Lit patterns and best practices

2. **Preserve Stencil versions:**

   - Rename original files with `stencil-` prefix
   - Example: `utils/helper.ts` → `utils/stencil-helper.ts`
   - Update any Stencil components still using these utilities to import from the prefixed versions

3. **Update import statements:**
   - Ensure the new Lit component uses the new Lit-compatible versions
   - Verify no circular dependencies are introduced

### 5. Testing Migration

**Update test files:**

- Adapt unit tests (`.spec.ts`) for Lit component testing patterns
- Update any component-specific test utilities
- Ensure E2E tests continue to work with the new component structure

### 6. Documentation Updates

**Update component documentation:**

- Review and update `.mdx` documentation file
- Update Storybook stories (`.new.stories.tsx`) for Lit component
- Ensure all examples work with the new implementation

### 7. Export Management

After migration, run the generate-lit-exports.mjs script:

```bash
cd packages/atomic && node scripts/generate-lit-exports.mjs
```

This updates the exports in `src/components/index.ts` for the new Lit component.

### 8. Validation Steps

**Before completing the migration:**

1. **Build verification:**

   - Ensure the component builds without errors
   - Run TypeScript checks
   - Verify Storybook stories render correctly

2. **Functionality testing:**

   - Run vitest tests
   - Run E2E tests if needed
   - Manual testing in Storybook

3. **Integration verification:**
   - Check that dependent components still work
   - Verify the component works in sample applications
   - Ensure accessibility features are preserved

## Migration Checklist

- [ ] Generate new Lit component structure using generate-component.mjs
- [ ] Migrate main component from .tsx to .ts
- [ ] Convert PostCSS styles to Tailwind CSS
- [ ] Migrate functional components/utils with stencil- prefixing
- [ ] Update unit tests for Lit patterns
- [ ] Update Storybook stories
- [ ] Update documentation (.mdx)
- [ ] Run generate-lit-exports.mjs
- [ ] Verify build passes
- [ ] Verify all tests pass
- [ ] Manual testing in Storybook
- [ ] Check integration with dependent components

## Important Notes

- **Preserve backward compatibility:** Ensure the new Lit component provides the same API and behavior
- **Maintain accessibility:** All ARIA attributes and keyboard navigation should be preserved
- **Follow conventions:** Use the established patterns from other Lit components in the codebase
- **Test thoroughly:** Both automated and manual testing are crucial for a successful migration

Ask me for the component name and directory if not provided, then proceed with the migration following these steps systematically.
