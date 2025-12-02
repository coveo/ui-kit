---
agent: 'agent'
description: 'Migrate an Atomic Stencil component to Lit with functional components/utils migration'
---

# Migrate Stencil Component to Lit

Migrate an existing Atomic Stencil component to Lit while preserving all functionality and maintaining project coding standards.

**Working directory:** `packages/atomic`

## Migration Requirements

Follow the guidelines from [Atomic component instructions](../instructions/atomic.instructions.md) for proper structure and conventions.

**Important:** Follow the migration steps in the exact order specified below. Do not skip ahead or reorder steps.

## Find Similar Migrated Components

**First, find equivalent components in other use cases (search/commerce/insight/recommendations) that were already migrated to Lit.**

**Example:** Migrating `atomic-query-error` (search) → look for `atomic-commerce-query-error` (commerce)

**How to identify:**
- Extract base name: `atomic-[use-case-]component-name` → `component-name`
- Search other use case folders for `atomic-*{base-name}*.ts` (`.ts` = Lit, `.tsx` = Stencil)
- Verify Lit migration: `@customElement` decorator present

**Analyze similar component for:**
- Path alias patterns (`@/src/...` vs relative imports) — **verify no `../` imports exist**
- Functional component usage (double invocation, render prefix)
- Controller/state binding patterns
- Tailwind CSS approach
- Template rendering (`html`, `nothing` vs `null`)

**If no similar component found:** Ask user if they know of one to reference.

## Pre-Migration: Analyze Import Paths

**Before starting migration, identify all imports that need path alias conversion:**

Use grep to find all relative imports in the target component:
```bash
grep -E "from '\.\./|from \"\.\\./" atomic-{name}.tsx
```

**Every import with `../` must be converted to `@/src/...` pattern.**

**Verification:** After migration, run the same grep on the new `.ts` file — should return zero matches.

**Include pattern discovery as a todo item:**
- [ ] Find and analyze similar migrated component in other use cases

### 1. First: Migrate Functional Components/Utils

**Before migrating the main component, handle any functional components or utilities it depends on:**

Use the dedicated prompt for functional component migration:
`.github/prompts/migrate-stencil-functional-component-to-lit.prompt.md`

**Quick checklist:**
- [ ] Rename original files with `stencil-` prefix
- [ ] Create new Lit versions with correct `FunctionalComponent*` types
- [ ] Update ALL Stencil component imports to use prefixed versions
- [ ] Verify no broken imports across all packages

For detailed guidance, patterns, and common pitfalls, refer to the dedicated prompt.

### 2. Generate New Lit Component Structure

Use the generate-component.mjs script to create the new Lit component structure:

```bash
node scripts/generate-component.mjs ${input:componentName} ${input:componentDirectory:src/components/common}
```

Ask for the component name (without `atomic-` prefix) and target directory if not provided.

**Important:** Do not check if the generation succeeded or look for generated files. The script will create the necessary structure - proceed directly to the next step.

### 3. File Migration Map

Migrate files according to this mapping:

**From Stencil format:**

- `atomic-{name}.tsx` → `atomic-{name}.ts` (main component)
- `atomic-{name}.pcss` → if there's a small number of styles, put them directly as Lit `css` in the static `style` property of the main component file; otherwise create a separate `atomic-{name}.tw.css.ts` file.
- Keep existing: `.spec.ts`, `.new.stories.tsx`, `.mdx`, `e2e/` files (do not modify tests)

### 4. Component Code Migration

**Convert Stencil syntax to Lit:**

- Replace `@Component` decorator with Lit `@customElement`
- Convert JSX templates to Lit `html` template literals
- Replace `@Prop()` with `@property()`
- Replace `@State()` with `@state()`
- Replace `@Event()` with custom event dispatching
- Replace `@Listen()` with appropriate event listeners
- Convert lifecycle methods (componentWillLoad → willUpdate, etc.)
- Replace CSS classes with Tailwind CSS utilities
- **Use Lit reactive controllers instead of Stencil context providers** (e.g., ProductContext should be a reactive controller)
- **Result template components:** Replace Stencil `@ResultContext()` decorator with `createResultContextController`:
  ```typescript
  import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
  
  private resultContext = createResultContextController(this);
  private get result(): Result {
    return this.resultContext.item as Result;
  }
  ```
- **Use Lit's `nothing` directive instead of `null` for conditional rendering**

**Light DOM Components:**

Light DOM components render without Shadow DOM for styling integration. Use `LightDomMixin` for this pattern.

```typescript
import {LightDomMixin} from '@/src/mixins/light-dom';

// Basic light DOM component
@customElement('atomic-result-number')
@bindings()
export class AtomicResultNumber
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>

// Light DOM component requiring bindings initialization
@customElement('atomic-icon')
export class AtomicIcon
  extends LightDomMixin(InitializeBindingsMixin(LitElement))
  implements InitializableComponent<AnyBindings>
```

**When to use:**
- `LightDomMixin(LitElement)` - Most light DOM components with `@bindings()` decorator
- `LightDomMixin(InitializeBindingsMixin(LitElement))` - Components needing binding initialization logic (e.g., components without use case-specific bindings)

**Import Path Migration (CRITICAL):**

**Rule:** Replace ALL `../` imports with `@/src/` path aliases.

**Conversion:** `../` → `@/src/` + full path from `src/` directory. Keep `./` (same-dir) imports.

**Examples:**
```typescript
'../../../utils/initialization-utils' → '@/src/utils/initialization-utils'
'../../common/query-error/details' → '@/src/components/common/query-error/details'
'./local-helper' → './local-helper' // ✅ Same-dir OK
```

**Verify after migration:** `grep -E "from '\.\./|from \"\.\\./" atomic-{name}.ts` → zero matches

**Template Rendering:**

- Convert JSX `null` returns to Lit's `nothing` directive
- Use `nothing` for conditional rendering when no content should be displayed
- Import `nothing` from 'lit' when needed

```typescript
// ❌ Stencil pattern
return condition ? <div>Content</div> : null;

// ✅ Lit pattern
import {nothing} from 'lit';
return condition ? html`<div>Content</div>` : nothing;
```

**Style Migration:**

- Convert PostCSS (`.pcss`) to Tailwind CSS (`.tw.css`)
- Replace CSS custom properties with Tailwind utilities where possible
- Maintain design system consistency

### 5. Common Migration Pitfalls and Corrections

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

**✅ Always keep global type declaration:**

```typescript
declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-pager': AtomicCommercePager;
  }
}
```

**Why:** During migration, both Stencil and Lit components coexist. The Stencil-generated types in `components.d.ts` will conflict, causing duplicate declaration errors. **This is expected and required.** The declaration ensures type safety for the new Lit component. Errors resolve after removing the Stencil component and rebuilding.

_Note: Duplicate declaration TypeScript errors are expected during migration—do not remove this block to "fix" them._

**❌ Missing or unnecessary CSS references:**

```typescript
// DON'T: Import styles if CSS only contains @reference directives
import styles from './atomic-component.tw.css?inline';
```

**✅ Include CSS references only when needed:**

```css
/* Include @reference if using custom Tailwind utilities */
@reference '../../../utils/coveo.tw.css';

/* Then add actual component styles... */
```

Remove styles import if CSS file only has `@reference` (already via `@withTailwindStyles`)

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

**❌ Incorrect functional component usage with children:**

```typescript
// DON'T: Pass children as a property
return renderPagerGuard({
  props: {
    hasError: this.searchStatusState.hasError,
    hasItems: this.searchStatusState.hasResults,
    isAppLoaded: this.isAppLoaded,
  },
  children: html`<div>Content</div>`, // ❌ Wrong: children as property
});
```

**✅ Correct functional component usage with children:**

```typescript
// DO: Double invocation - call returns function, then call that with children
return renderPagerGuard({
  props: {
    hasError: this.searchStatusState.hasError,
    hasItems: this.searchStatusState.hasResults,
    isAppLoaded: this.isAppLoaded,
  },
})(html`
  ${renderPagerNavigation({
    props: {
      i18n: this.bindings.i18n,
    },
  })(html`<div>Navigation content</div>`)}
`);
```

**❌ Forgot to convert relative imports:**

```typescript
// Migration incomplete - still has relative paths
import {renderButton} from '../../../common/button';
import {bindings} from '../../../../decorators/bindings';
```

**✅ All imports use path aliases:**

```typescript
import {renderButton} from '@/src/components/common/button';
import {bindings} from '@/src/decorators/bindings';
import {localHelper} from './local-helper'; // Same-dir OK
```

Verify: `grep -E "from '\.\./|from \"\.\\./" atomic-{name}.ts` → zero matches

**❌ Including empty styles:**

```typescript
// DON'T: Import styles if only global imports exist
import styles from './atomic-component.tw.css?inline';

// In CSS file with only: /* @reference '../../../utils/coveo.tw.css'; */
```

**✅ Remove empty styles imports:**

```typescript
// DO: Omit styles import if CSS only contains @reference directives
// (already included through @withTailwindStyles decorator)
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

**❌ Incorrect conditional rendering:**

```typescript
// DON'T: Use null, undefined, or empty templates
return condition ? html`<div>Content</div>` : null;
return condition ? html`<div>Content</div>` : html``;
```

**✅ Correct conditional rendering with nothing:**

```typescript
import {nothing} from 'lit';

return condition ? html`<div>Content</div>` : nothing;
html`<div>${shouldShow ? html`<span>Content</span>` : nothing}</div>`;
```

**❌ Missing result context controller:**

```typescript
// DON'T: Try to access result without controller
@ResultContext() result!: Result;  // Stencil pattern
```

**✅ Correct result context setup:**

```typescript
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';

private resultContext = createResultContextController(this);
private get result(): Result {
  return this.resultContext.item as Result;
}
```

## Important Constraints

Focus on code/style/functional migration only. Do not: build, test, lint, modify test files, or verify generation script outputs (unless user requests).

## Migration Checklist

**Track your progress systematically through these steps - order is critical:**

Work on ONE step at a time, marking each complete before proceeding to the next. This ensures nothing is missed in the complex migration workflow.

**Follow this exact order:**

- [ ] **Step 0:** Find and analyze similar migrated component in other use cases for pattern reference
- [ ] **Step 1:** Migrate functional components/utils with stencil- prefixing
- [ ] **Step 2:** Update ALL imports across ALL use cases (commerce, search, headless, etc.) when renaming utilities
- [ ] **Step 3:** Verify no broken imports remain in any package using global search
- [ ] **Step 4:** Generate new Lit component structure using generate-component.mjs
- [ ] **Step 5:** Migrate main component from .tsx to .ts
- [ ] **Step 6:** Convert PostCSS styles to Tailwind CSS
- [ ] **Step 7:** Verify correct InitializableComponent import and implementation
- [ ] **Step 8:** Add @bindings() decorator and bindings state property
- [ ] **Step 9:** Add global HTMLElementTagNameMap declaration (duplicate declaration errors expected until Stencil removal)
- [ ] **Step 10:** Use `type` imports for type-only imports (e.g., `import type {Bindings}` or `import {type QueryError}`)
- [ ] **Step 11:** Include CSS @reference if using custom Tailwind utilities; omit styles import if CSS only has @reference
- [ ] **Step 12:** Ensure functional component methods start with 'render' prefix
- [ ] **Step 13:** Use correct functional component pattern (double invocation with children)
- [ ] **Step 14:** Use correct bindStateToController import from decorators
- [ ] **Step 15:** Use Lit reactive controllers instead of Stencil context providers
- [ ] **Step 16:** Use Lit's `nothing` directive for conditional rendering (not `null`/`undefined`)
- [ ] **Step 17:** Verify path aliases: run `grep -E "from '\.\./|from \"\.\\./" atomic-{name}.ts` → expect zero matches

## Important Notes

- **Preserve backward compatibility:** Ensure the new Lit component provides the same API and behavior
- **Maintain accessibility:** All ARIA attributes and keyboard navigation should be preserved
- **Follow conventions:** Use the established patterns from other Lit components in the codebase
- **Focus on migration only:** Do not build, test, or lint unless explicitly requested
- **Step order matters:** Always follow the numbered steps in sequence

Ask me for the component name and directory if not provided, then proceed with the migration following these steps systematically.
