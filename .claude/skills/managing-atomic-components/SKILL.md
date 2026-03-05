---
name: managing-atomic-components
description: Provides conventions, patterns, and architecture for Atomic Lit web components (custom elements) in packages/atomic. Use when creating, modifying, analyzing, debugging, or reviewing Atomic components, or when the user mentions Lit, custom elements, web components, Atomic components, decorators, or component lifecycle.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
---

# Managing Atomic Components

## Component Directory Structure

`atomic-{component-name}/`
- `atomic-{component-name}.ts`: Main component (Lit)
- `atomic-{component-name}.tw.css.ts`: Styles (Tailwind; optional)
- `atomic-{component-name}.spec.ts`: Unit tests (Vitest)
- `atomic-{component-name}.mdx`: Public Docs page (Storybook)
- `atomic-{component-name}.new.stories.tsx`: Stories (Storybook)
- `e2e/`: End-to-end tests (Playwright; optional)
  - `atomic-{component-name}.e2e.ts`: E2E test suite
  - `page-object.ts`: Page object for E2E test suite
  - `fixture.ts`: Fixture for E2E test suite   
- `*.ts`: Supporting files (optional)

**Notes**:
- The `.tw.css.ts` file is only included when complex styles are required; otherwise component styles are usually set directly in the Lit component's static `styles` property
- Internal components may lack the `e2e/` directory
- Complex components may have one or more `.ts` helper files

## Component Class Structure

### Decorator stack

```typescript
@customElement('atomic-element-name')  // Always required
@bindings()                            // Engine/interface bindings only
@withTailwindStyles                    // Shadow DOM + Tailwind only
export class AtomicElement
  extends LitElement
  implements InitializableComponent<Bindings>
```

**Light DOM components** use mixins instead of extending `LitElement` directly:
- `LightDomMixin(LitElement)` — most light DOM components with `@bindings()`
- `LightDomMixin(InitializeBindingsMixin(LitElement))` — components needing binding initialization without use-case-specific bindings

### Field declaration order

1. `private static readonly propsSchema` — if the component uses `ValidatePropsController`
2. `static styles` — immediately after propsSchema (or class declaration if no schema)
3. `@property()` fields (public reactive properties)
4. `@state()` fields in this order:
   - `bindings` (initializable components)
   - `error` (initializable components)
   - Controller-bound state (`@bindStateToController`)
   - Other public state
   - Private state
5. Non-decorated fields (controllers, refs, etc.)

### Method declaration order

1. **Custom element lifecycle**: `constructor` → `connectedCallback` → `disconnectedCallback` → `adoptedCallback` → `attributeChangedCallback`
2. **Public methods/getters**: `initialize()` first, then alphabetical
3. **Lit reactive lifecycle**: `shouldUpdate` → `willUpdate` → `update` → `render` → `firstUpdated` → `updated`
4. **Private methods/getters**: any order

### Architecture preference

Decorators > Mixins > Lit reactive controllers. Use controllers when they provide clear lifecycle/state management benefits.

## Documentation Requirements

**Component class JSDoc:**
- First sentence: "The `atomic-element-name` component [description]."
- Shadow parts: `@part partName - Description.`
- Events: `@event eventName - Description.`
- Slots: `@slot slotName - Description.` (use `@slot default - Description.` for unnamed slot)

**Property JSDoc**: Start every `@property` description with "The", "A", "An", or "Whether".

## Progressive Disclosure

For creating, implementing, or substantially modifying a component, load the detailed reference:

- [component-implementation.md](references/component-implementation.md) — base class selection, bindings types, decorators, property validation, initialization, rendering patterns, styles, result templates, global registration
