---
mode: 'agent'
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

**Use `tw` + `multiClassMap` for conditional classes:**
```typescript
import {multiClassMap, tw} from '@/src/directives/multi-class-map';

const classNames = tw({
  'rounded-lg border p-4': true,
  'border-primary bg-primary-50': props.isHighlighted,
  'border-neutral-dark bg-white': !props.isHighlighted,
  [props.class ?? '']: Boolean(props.class),
});

return html`<div class=${multiClassMap(classNames)}>Content</div>`;
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

**Use `manage_todo_list` tool:** Write todos from items below, mark ONE in-progress before working, mark completed immediately after.

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
- [ ] Generate execution summary (mandatory final todo)

Ask for file path if not provided, then execute systematically.

## Post-Execution Summary

**Mandatory final todo:** Generate `.github/prompts/.executions/migrate-stencil-functional-component-to-lit-[YYYY-MM-DD-HHmmss].prompt-execution.md` following `TEMPLATE.prompt-execution.md`.

**Include:** Reference components used, type selection issues, ambiguous instructions, time-consuming operations, missing guidance, concrete improvement suggestions.

**Inform user** of summary location and suggest "Prompt Engineer" chatmode for optimization. Mark complete only after file created and user informed.
