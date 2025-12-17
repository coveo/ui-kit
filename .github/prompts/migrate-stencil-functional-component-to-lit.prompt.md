---
agent: 'agent'
description: 'Migrate an Atomic Stencil functional component to Lit functional component'
---

# Migrate Stencil Functional Component to Lit

Migrate an existing Atomic Stencil functional component to Lit while preserving all functionality and maintaining project coding standards.

**Context:** All commands run from `packages/atomic` directory.

Follow [Atomic component instructions](../instructions/atomic.instructions.md) for structure and conventions.

### Core Pattern

**Parallel file approach:**
1. Keep original Stencil file completely untouched (preserve filename)
2. Create Lit version as new file alongside original (use `.ts` if original is `.tsx`)
3. **DO NOT update any imports** - Lit version exists as unused code for future components

## Type Signatures and Patterns

**Import types:**
```typescript
import type {
  FunctionalComponent,
  FunctionalComponentNoProps,
  FunctionalComponentWithChildren,
  FunctionalComponentWithChildrenNoProps,
  FunctionalComponentWithOptionalChildren,
} from '@/src/utils/functional-component-utils';
```

**Basic component (no children):**
```typescript
interface Props { title: string; isActive: boolean; }

export const renderButton: FunctionalComponent<Props> = ({props}) => {
  return html`<button class="btn ${props.isActive ? 'bg-primary' : 'bg-secondary'}">
    ${props.title}
  </button>`;
};
```

**Component with children (returns function accepting children):**
```typescript
export const renderContainer: FunctionalComponentWithChildren<Props> =
  ({props}) => (children) => html`<div class="container">${children}</div>`;

// Usage: renderContainer({props: {...}})(html`<span>Child</span>`)
```

**Key changes from Stencil:**
- Props: `({props})` not `({title, isActive})`
- Children: `({props}) => (children) => ...` not `(props, children) => ...`
- Events: `@click=${handler}` not `onClick={handler}`
- Templates: `html` template literals not JSX

## Lit Directives

**Import from `lit/directives/[name].js`:**
```typescript
import {when} from 'lit/directives/when.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref, type RefOrCallback} from 'lit/directives/ref.js';
import {nothing} from 'lit';
```

### `ifDefined` - Wrap all optional attributes
```typescript
html`<input type=${ifDefined(props.type)} id=${ifDefined(props.id)} />`
```

### `when` - Conditional rendering
```typescript
${when(props.condition, () => html`<div>True</div>`)}
${when(props.show, () => html`<div>A</div>`, () => html`<div>B</div>`)}
```

### `ref` - Forward element references
```typescript
html`<input ${props.ref ? ref(props.ref) : nothing} />`
```

## Tailwind Classes

**Use `tw` + `multiClassMap` only for conditional or dynamic classes.** For components with only static classes, use plain class strings.

**Conditional classes (use tw/multiClassMap):**
```typescript
import {multiClassMap, tw} from '@/src/directives/multi-class-map';

const classNames = tw({
  'border-primary bg-primary-50': props.isHighlighted,
  'border-neutral-dark bg-white': !props.isHighlighted,
  [props.class ?? '']: Boolean(props.class), // Dynamic user classes
});

return html`<div class="rounded-lg border p-4 ${multiClassMap(classNames)}">Content</div>`;
```

**Static classes only (plain strings):**
```typescript
// ✅ Good - no conditional logic
return html`<div class="flex items-center gap-2">Content</div>`;

// ❌ Avoid - unnecessary tw/multiClassMap
const classNames = tw({'flex items-center gap-2': true});
return html`<div class=${multiClassMap(classNames)}>Content</div>`;
```

**Mixed static and conditional:**
```typescript
const dynamicClasses = tw({
  'bg-primary': props.isPrimary,
  'bg-secondary': !props.isPrimary,
});

// Static classes in string, conditional via multiClassMap
return html`<button class="px-4 py-2 rounded ${multiClassMap(dynamicClasses)}">
  ${props.label}
</button>`;
```

## Naming Conventions

**Files:** Keep original Stencil file (`facet-placeholder.tsx`), create Lit version with `.ts` extension (`facet-placeholder.ts`). Both coexist; imports reference original until consumers migrate.

**Functions:** Use `render<ComponentName>` pattern with PascalCase after prefix.
```typescript
// ✅ Correct
export const renderButton: FunctionalComponent<Props> = ...
export const renderFacetPlaceholder: FunctionalComponentNoProps = ...

// ❌ Wrong
export const Button = ... // missing prefix
export const renderbutton = ... // lowercase after 'render'
```

## Execution Constraints

**Skip unless requested:** Building, testing, linting, compilation checks (until consumers migrate)
**Focus on:** Component migration, type/import updates, Tailwind styling

## Migration Checklist

**Track your progress systematically:** Break down the migration into these sequential tasks, work on ONE at a time, and mark each complete before proceeding to the next.

**Phase 1: Analyze**
- [ ] Analyze existing component (signature, children, dependencies)
- [ ] Identify correct `FunctionalComponent*` type

**Phase 2: Migrate**
- [ ] Keep original Stencil file untouched
- [ ] Create new `.ts` file with `render<ComponentName>` function
- [ ] Import correct type from `@/src/utils/functional-component-utils`
- [ ] Use `({props})` destructuring, `html` templates, `@event` syntax
- [ ] Apply directives: `ifDefined`, `when`, `ref`
- [ ] Use `tw`/`multiClassMap` for classes
- [ ] Use `@/src/...` imports for external files

**Phase 3: Validate Equivalence**
- [ ] Verify props, children handling, conditionals, events, structure, styling match original
- [ ] Document intentional differences

**Phase 4: Verify Isolation**
- [ ] Original file exists with original name
- [ ] New Lit version not imported anywhere (dead code)

Ask for file path if not provided, then execute systematically.
