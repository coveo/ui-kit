---
mode: 'agent'
description: 'Migrate an Atomic Stencil functional component to Lit functional component'
---

# Migrate Stencil Functional Component to Lit

Migrate an existing Atomic Stencil functional component to Lit while preserving all functionality and maintaining project coding standards.

**Context:** All commands run from `packages/atomic` directory.

## Migration Strategy

Follow [Atomic component instructions](../instructions/atomic.instructions.md) for structure and conventions.

### Core Pattern

**Preserve-and-replace approach:**
1. Rename original file with `stencil-` prefix (e.g., `render-helper.ts` → `stencil-render-helper.ts`)
2. Create new Lit version with original filename
3. Update imports: Stencil components use prefixed version, Lit components use new version

## Type Signatures and Patterns

**Import functional component types from:**
```typescript
import type {
  FunctionalComponent,
  FunctionalComponentNoProps,
  FunctionalComponentWithChildren,
  FunctionalComponentWithChildrenNoProps,
  FunctionalComponentWithOptionalChildren,
} from '@/src/utils/functional-component-utils';
```

**Available type patterns:**

- `FunctionalComponentNoProps` - No props, no children
- `FunctionalComponent<Props>` - Has props, no children
- `FunctionalComponentWithChildrenNoProps` - No props, has children
- `FunctionalComponentWithChildren<Props>` - Has props, has children
- `FunctionalComponentWithOptionalChildren<Props>` - Has props, optional children

**Basic functional component (no children):**
```typescript
interface Props {
  title: string;
  isActive: boolean;
}

export const renderButton: FunctionalComponent<Props> = ({props}) => {
  return html`<button class="btn ${props.isActive ? 'bg-primary' : 'bg-secondary'}">
    ${props.title}
  </button>`;
};
```

**Functional component with children (returns a function that accepts children):**
```typescript
export const renderContainer: FunctionalComponentWithChildren<Props> =
  ({props}) =>
  (children) => {
    return html`<div class="container">${children}</div>`;
  };

// Calling pattern - note the double invocation:
renderContainer({props: {...}})(html`<span>Child content</span>`)

// Or when passing nothing:
renderContainer({props: {...}})(nothing)
```

**Key differences from Stencil:**
- Destructure `{props}` not individual properties
- Use `html` template literals not JSX
- Event handlers: `@click=${handler}` not `onClick={handler}`
- Conditional render: return `nothing` (import from `lit`) not `null`

## Common Patterns

**List rendering:**
```typescript
export const renderList: FunctionalComponent<Props> = ({props}) => html`
  ${props.items.map((item) => html`<li>${item}</li>`)}
`;
```

**Conditional rendering:**
```typescript
import {nothing} from 'lit';

export const renderConditional: FunctionalComponent<Props> = ({props}) =>
  props.condition ? html`<div>${props.content}</div>` : nothing;
```

**Event handling:**
```typescript
export const renderClickable: FunctionalComponent<Props> = ({props}) => {
  return html`<button @click=${props.onClick}>${props.label}</button>`;
};
```

**Tailwind class application:**
```typescript
html`<div
  class="${props.isHighlighted
    ? 'border-primary bg-primary-50'
    : 'border-gray-200 bg-white'} rounded-lg border p-4"
></div>`;
```

## Critical Corrections

**❌ Wrong type import:**
```typescript
import {FunctionalComponent} from '@stencil/core';
// or
import {FunctionalComponent} from '@/src/functional-components/types';
```

**✅ Correct type import:**
```typescript
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
```

**❌ Wrong destructuring:**
```typescript
export const render = ({title, isActive}: Props) => html`...`;
```

**✅ Correct destructuring:**
```typescript
export const render: FunctionalComponent<Props> = ({props}) => html`...${props.title}...`;
```

**❌ Children as second parameter:**
```typescript
export const render = (props, children) => html`<div>${children}</div>`;
```

**✅ Children as returned function:**
```typescript
export const render: FunctionalComponentWithChildren<Props> =
  ({props}) => (children) => html`<div>${children}</div>`;
```

## Import Update Process

1. **Find all usages** across packages:
   ```bash
   # Direct imports from the file
   grep -rE "from ['\"].*functionName['\"]" packages/
   
   # Usage of the function (may be imported from barrel/index)
   grep -rE "\\brenderFunctionName\\(" packages/
   ```

2. **Update systematically:**
   - Stencil components → import from `stencil-prefixed-file`
   - Lit components → import from new file

3. **Verify no broken imports** remain before finishing

## Execution Constraints

**Do not (unless explicitly requested):**
- Build the Atomic package
- Run or generate tests
- Fix linting issues
- Modify test files
- Check compilation until related components migrated

**Focus exclusively on:**
- Functional component migration
- Type definition updates
- Import statement updates
- Style migration to Tailwind

## Migration Checklist

**Phase 1: Analyze & Prepare**
- [ ] Analyze existing component (signature, children handling, dependencies, usage)
- [ ] Identify correct `FunctionalComponent*` type based on props/children

**Phase 2: Migrate File**
- [ ] Rename original file with `stencil-` prefix
- [ ] Create new Lit version with original filename
- [ ] Import correct type from `@/src/utils/functional-component-utils`
- [ ] Update signature: use `{props}` destructuring, not direct props
- [ ] Convert JSX → `html` template literals
- [ ] Convert event syntax: `@click` not `onClick`
- [ ] Apply Tailwind classes instead of CSS
- [ ] Convert imports: use `@/src/...` path aliases for external files, `./...` only for same-directory

**Phase 3: Update Imports**
- [ ] Search ALL imports across ALL packages (use provided grep commands)
- [ ] Update Stencil component imports → prefixed versions
- [ ] Update Lit component imports → new versions
- [ ] Verify no broken imports remain

Ask for the functional component file path if not provided, then execute migration systematically.

## Post-Execution: Generate Summary

After completing migration, generate execution summary:

**1. Create summary file:**
- **Location:** `.github/prompts/.executions/migrate-stencil-functional-component-to-lit-[YYYY-MM-DD-HHmmss].prompt-execution.md`
- **Structure:** Follow `.github/prompts/.executions/TEMPLATE.prompt-execution.md`
- **Purpose:** Structured feedback for prompt optimization

**2. Include in summary:**
- Which similar migrated component was used as reference (if any)
- Issues with type signature selection or pattern matching
- Ambiguities in prompt instructions that required interpretation
- Time-consuming operations (searching imports, updating files)
- Missing instructions or unclear migration requirements
- Concrete suggestions for prompt improvements

**3. Inform user** about summary location and next steps (switch to "Prompt Engineer" chatmode for optimization)

**4. Mark complete** only after file created and user informed.

```
