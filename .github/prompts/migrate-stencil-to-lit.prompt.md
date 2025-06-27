---
mode: 'agent'
description: 'Migrate an atomic Stencil component to Lit with functional components/utils migration'
---

# Migrate Stencil Component to Lit

Your goal is to migrate an existing atomic Stencil component to a modern Lit-based component while preserving all functionality and maintaining the project's coding standards.

**Note: All commands in this migration should be run from the `packages/atomic` directory.**

## Migration Requirements

Follow the guidelines from [atomic component instructions](../instructions/atomic.instructions.md) for proper structure and conventions.

### 1. Generate New Lit Component Structure

Use the generate-component.mjs script to create the new Lit component structure:

```bash
node scripts/generate-component.mjs ${input:componentName} ${input:componentDirectory:src/components/common}
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

### 4. Common Migration Pitfalls and Corrections

**❌ Incorrect InitializableComponent usage:**

```typescript
// DON'T: Using wrong import or implementation
import {InitializableComponent} from 'somewhere/else';
```

**✅ Correct InitializableComponent usage:**

```typescript
import {InitializableComponent} from '@/src/decorators/types';

export class AtomicCommercePager
  extends LitElement
  implements InitializableComponent<CommerceBindings>
```

**❌ Missing bindings decorator/mixin:**

```typescript
// DON'T: Forget to add bindings decorator
@customElement('atomic-commerce-pager')
export class AtomicCommercePager extends LitElement
```

**✅ Correct bindings setup:**

```typescript
import {bindings} from '@/src/decorators/bindings';

@customElement('atomic-commerce-pager')
@bindings()
@withTailwindStyles
export class AtomicCommercePager
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;
  // ...
}
```

**❌ Removing global type declaration:**

```typescript
// DON'T: Remove this declaration even if there are errors
// export class AtomicCommercePager extends LitElement { }
// (missing global declaration)
```

**✅ Keep global type declaration:**

```typescript
declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-pager': AtomicCommercePager;
  }
}
```

_Note: TypeScript errors are normal until rebuilding atomic package_

**❌ Missing CSS file references:**

```css
/* DON'T: Forget to include required Tailwind utilities */
/* Missing @reference for custom utils */
```

**✅ Include all required CSS references:**

```css
@reference '../../../utils/coveo.tw.css';
/* Include this if component uses custom Tailwind utilities */
```

**❌ Incorrect functional component method naming:**

```typescript
// DON'T: Use non-render prefixed methods
private pagerButton() { }
private buttonElement() { }
```

**✅ Correct functional component method naming:**

```typescript
// DO: All FC methods must start with 'render'
private renderPagerButton() { }
private renderButtonElement() { }
```

**❌ Wrong bindStateToController import:**

```typescript
// DON'T: Use old utility import
import {BindStateToController} from '@/src/utils/initialization-utils';
```

**✅ Correct bindStateToController import:**

```typescript
// DO: Use the decorator version
import {bindStateToController} from '@/src/decorators/bind-state';
```

### 5. Functional Components/Utils Migration

**For any functional components or utilities used by the component:**

1. **Create Lit versions:**

   - Migrate the functional logic to work with Lit (functional components are always in separate files, never inline them in the main component)
   - Update imports and usage in the main component
   - Follow Lit patterns and best practices
   - Make sure to use the correct FunctionalComponentX type for each component

2. **Preserve Stencil versions:**

   - Rename original files with `stencil-` prefix
   - Example: `utils/helper.ts` → `utils/stencil-helper.ts`
   - **Update ALL Stencil components across ALL use cases** (commerce, search, headless, etc.) that import these utilities to use the prefixed versions
   - Search the entire codebase for imports of the renamed utilities

3. **Update import statements:**
   - Ensure the new Lit component uses the new Lit-compatible versions
   - **Search across all packages and use cases** for any imports that need updating
   - Verify no circular dependencies are introduced
   - Use global search to find all references: `grep -r "import.*helper" packages/` (replace with actual utility name)

### 6. Testing Migration

**Update test files:**

- Adapt unit tests (`.spec.ts`) for Lit component testing patterns
- Update any component-specific test utilities
- Ensure E2E tests continue to work with the new component structure

### 7. Documentation Updates

**Update component documentation:**

- Review and update `.mdx` documentation file
- Update Storybook stories (`.new.stories.tsx`) for Lit component
- Ensure all examples work with the new implementation

### 8. Export Management

After migration, run the generate-lit-exports.mjs script:

```bash
node scripts/generate-lit-exports.mjs
```

This updates the exports in `src/components/index.ts` for the new Lit component.

### 9. Validation Steps

**Before completing the migration:**

1. **Build verification:**

   - Ensure the component builds without errors
   - Run TypeScript checks
   - Verify Storybook stories render correctly

2. **Functionality testing:**

   - Run unit tests: `npm test -- atomic-{name}.spec.ts`
   - Run E2E tests if available
   - Manual testing in Storybook

3. **Integration verification:**
   - Check that dependent components still work
   - Verify the component works in sample applications
   - Ensure accessibility features are preserved

## Migration Checklist

- [ ] Generate new Lit component structure using generate-component.mjs
- [ ] Migrate main component from .tsx to .ts
- [ ] Convert PostCSS styles to Tailwind CSS
- [ ] **Verify correct InitializableComponent import and implementation**
- [ ] **Add @bindings() decorator and bindings state property**
- [ ] **Keep global HTMLElementTagNameMap declaration (ignore TS errors until rebuild)**
- [ ] **Include all required CSS references (e.g., @reference '../../../utils/coveo.tw.css')**
- [ ] **Ensure functional component methods start with 'render' prefix**
- [ ] **Use correct bindStateToController import from decorators**
- [ ] Migrate functional components/utils with stencil- prefixing
- [ ] **Update ALL imports across ALL use cases (commerce, search, headless, etc.) when renaming utilities**
- [ ] **Verify no broken imports remain in any package using global search**
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
