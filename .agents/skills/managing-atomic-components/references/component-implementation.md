# Component Implementation

Detailed patterns for implementing and modifying Atomic Lit component logic.

## New Component Checklist

After creating the component directory and files (see SKILL.md for structure):

1. **Choose the right base class** — see table below.
2. **Choose the right bindings type** — import the correct `Bindings` for the use case.
3. **Register the component** — add a side-effect import in the relevant interface's barrel file if the component should auto-load.
4. **Verify `collection-manifest.json`** — auto-generated on build; confirm the new component appears.

### Base Class Selection

**Shadow DOM is the default.** Most new components should use `LitElement` (Shadow DOM). Light DOM (`LightDomMixin`) is the exception — only use it when the component must participate in the parent document's style/layout context (e.g., result template components). A CI check (`check-no-new-light-dom-components.mjs`) flags any new Light DOM component to ensure it was a deliberate decision.

| Scenario                           | Base class                                            | Notes                                         |
| ---------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| Shadow DOM + Tailwind + bindings   | `LitElement` with `@withTailwindStyles` `@bindings()` | Most common pattern                           |
| Shadow DOM + bindings, no Tailwind | `LitElement` with `@bindings()`                       | Use `static styles = css\`...\``              |
| Light DOM + bindings               | `LightDomMixin(LitElement)` with `@bindings()`        | Result template components, etc.              |
| Light DOM + initialization mixin   | `LightDomMixin(InitializeBindingsMixin(LitElement))`  | Components without use-case-specific bindings |
| Standalone (no bindings)           | `LitElement` with `@customElement()` only             | Rare, utility components                      |

### Bindings Type by Use Case

```typescript
// Search
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';

// Commerce
import type {CommerceBindings as Bindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';

// Insight
import type {InsightBindings as Bindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
```

## Decorators

See SKILL.md for the decorator stack order and base class/mixin selection.

### `@bindingGuard()` and `@errorGuard()`

Applied to the `render()` method. `@bindingGuard()` prevents rendering before bindings are ready. `@errorGuard()` catches render errors and displays an error state.

```typescript
@bindingGuard()
@errorGuard()
render() {
  return html`...`;
}
```

### `@bindStateToController('controllerFieldName')`

Binds a Headless controller's state to a `@state()` field. The controller field and state field must follow a naming convention:

```typescript
// Controller field: querySummary
// State field: querySummaryState (controller name + "State")
@bindStateToController('querySummary')
@state()
public querySummaryState!: QuerySummaryState;
public querySummary!: QuerySummary;
```

The controller is built in `initialize()` and subscribed to automatically.

## Multi-word Attributes

Lit lowercases attribute names by default. For multi-word properties, explicitly set the `attribute` option to kebab-case:

```typescript
@property({type: Number, reflect: true, attribute: 'heading-level'})
headingLevel = 0;
```

Without `attribute: 'heading-level'`, the HTML attribute would be `headinglevel`.

## Property Validation

Use `ValidatePropsController` for non-boolean properties. Boolean properties don't require validation.

Declare the schema once as a `private static readonly` field, then reference it in the constructor:

```typescript
private static readonly propsSchema = new Schema({
  injectionDepth: new NumberValue({min: 0, required: false}),
  headingLevel: new NumberValue({min: 0, max: 6, required: false}),
});

constructor() {
  super();

  new ValidatePropsController(
    this,
    () => ({
      injectionDepth: this.injectionDepth,
      headingLevel: this.headingLevel,
    }),
    AtomicTimeframeFacet.propsSchema,
    false
  );
}
```

Bueno schema types: `StringValue`, `NumberValue`, `BooleanValue`, `SchemaDefinition`, `ArrayValue`.

## Initialization

Components with `@bindings()` use `initialize()` to build Headless controllers and register event listeners. Called automatically after bindings are resolved.

```typescript
public initialize() {
  this.querySummary = buildQuerySummary(this.bindings.engine);
  this.addEventListener('custom-event', this.handleEvent as EventListener);
}
```

Always remove event listeners in `disconnectedCallback()`:

```typescript
disconnectedCallback() {
  super.disconnectedCallback();
  this.removeEventListener('custom-event', this.handleEvent as EventListener);
}
```

## Interdependent Component Imports

When a component uses another `atomic-*` element in its template or creates one dynamically, **import that element's module** as a side-effect:

```typescript
// Element used in template — side-effect import
import '@/src/components/common/atomic-icon/atomic-icon';

render() {
  return html`<atomic-icon icon="search"></atomic-icon>`;
}
```

```typescript
// Element created dynamically — side-effect import
import '@/src/components/search/atomic-refine-modal/atomic-refine-modal';

private createModal() {
  const modal = document.createElement('atomic-refine-modal');
  this.host.appendChild(modal);
}
```

Type-only imports (`import type {...}`) do **not** register the custom element.

## Rendering

### Template syntax

Use Lit `html` tagged templates with directives:

```typescript
import {html, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
```

### Conditional rendering with `when`

```typescript
render() {
  return html`
    ${when(
      this.isVulcan,
      () => html`🖖 ${this.entityToGreet}!`,
      () => html`👋 ${this.entityToGreet}!`
    )}
    ${when(this.hasQuery, () => this.renderQuery())}
  `;
}
```

### Rendering nothing

Use the `when` directive for conditional rendering (not ternaries with `nothing`):

```typescript
// ✅ Preferred — when directive
${when(condition, () => html`<div>Content</div>`)}

// ❌ Avoid — ternary with nothing
condition ? html`<div>Content</div>` : nothing;
```

### Conditional CSS classes

Use `classMap` for conditional classes:

```typescript
html`<div class=${classMap({'active': this.isActive, 'disabled': this.isDisabled})}>
  Content
</div>`;
```

For Tailwind-specific conditional classes, use `tw` + `multiClassMap`:

```typescript
import {multiClassMap, tw} from '@/src/directives/multi-class-map';

const classNames = tw({
  'border-primary bg-primary-50': props.isHighlighted,
  'border-neutral-dark bg-white': !props.isHighlighted,
});

return html`<div class="rounded-lg border p-4 ${multiClassMap(classNames)}">Content</div>`;
```

### Refs

```typescript
import {createRef, ref} from 'lit/directives/ref.js';

private inputRef = createRef<HTMLInputElement>();

render() {
  return html`<input ${ref(this.inputRef)} />`;
}

firstUpdated() {
  this.inputRef.value?.focus();
}
```

## Styles

### Shadow DOM (most components)

Inline styles via `static styles`:

```typescript
static styles: CSSResultGroup = css`
  :host {
    overflow: hidden;
  }
`;
```

For complex Tailwind styles (100+ lines or shared), use a separate `.tw.css.ts` file:

```typescript
// atomic-element.tw.css.ts
import {css} from 'lit';
export const styles = css`...`;

// atomic-element.ts
import {styles} from './atomic-element.tw.css.js';
static styles = styles;
```

### Light DOM

Light DOM components (via `LightDomMixin`) render without Shadow DOM. They inherit styles from the parent context. Do not define `static styles`.

## Result/Product Template Components

Components inside result templates access data through context controllers:

```typescript
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';

private resultContext = createResultContextController(this);
private get result(): Result {
  return this.resultContext.item as Result;
}
```

Commerce product templates use a similar pattern with product context.

These components typically:
- Extend `LightDomMixin(LitElement)` (light DOM)
- Self-remove when the field value is null/undefined
- Use `ResultTemplatesHelpers.getResultProperty()` to extract field values

## Global Registration

Every component class should declare its tag name in the global `HTMLElementTagNameMap`:

```typescript
declare global {
  interface HTMLElementTagNameMap {
    'atomic-element-name': AtomicElementName;
  }
}
```

Place this at the end of the component file, outside the class.
