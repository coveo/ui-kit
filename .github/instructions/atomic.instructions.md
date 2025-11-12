---
applyTo: 'packages/atomic/**'
---

**All new Atomic components must be Lit components, not Stencil.** This document describes structure and conventions for Atomic components.

**Generate new components from `packages/atomic` directory:**

```bash
node scripts/generate-component.mjs component-name src/components/common
```

The generated boilerplate demonstrates established patterns. Follow these conventions for consistency.

## Component Directory Structure

Atomic components live in `src/components/` organized by use case:

- `/commerce` - Components exclusive to the commerce use-case
- `/common` - Shared components across all interfaces
- `/search` - Components exclusive to the search use-case
- `/insight` - Components exclusive to the Insight use-case
- `/ipx` - Components exclusive to the In-Product Experience use case
- `/recommendations` - Components exclusive to the Recommendations use case

### Lit Component Files (New Standard)

Each component has an `atomic-*` directory with:

- `atomic-name.ts` - Main component (TypeScript)
- `atomic-name.tw.css.ts` - Styles (Optional; Tailwind CSS)
- `atomic-name.spec.ts` - Unit tests
- `atomic-name.mdx` - Documentation
- `atomic-name.new.stories.tsx` - Storybook stories
- `e2e/atomic-name.e2e.ts` - End-to-end tests (happy path + accessibility)
- `e2e/fixture.ts` - E2E test setup
- `e2e/page-object.ts` - E2E interaction layer

### Stencil Component Files (Legacy)

Legacy components use `.tsx` (Stencil) and `.pcss` (PostCSS). Same structure otherwise. Gradually migrating to Lit.

## Naming Conventions

- Component tag: `atomic-kebab-case` (e.g., `atomic-search-box`)
- File names: `atomic-kebab-case.ts` (match tag name)
- Class names: `AtomicPascalCase` (e.g., `AtomicSearchBox`)
- All component files share the same base name

## Lit Component Implementation

### Component Class Documentation

**Start with:** "The `atomic-element-name` component [description]."

**Document shadow parts:** `@part partName - Description of the part's purpose.`

**Document events:** `@event eventName - Description of when/why emitted.`

**Document slots:** `@slot slotName - Description.` (Use `@slot (default) - Description.` for default slot)

### Property Documentation

Start every `@property` field doc with: "The", "A", "An", or "Whether".

**Example:**
```typescript
/**
 * The maximum number of results to display.
 */
@property({type: Number}) max = 10;

/**
 * Whether the component displays in compact mode.
 */
@property({type: Boolean}) compact = false;
```

### Decorators and Class Structure

**Always use:**
- `@customElement('atomic-element-name')` on component class

**Use when applicable:**
- `@bindings()` - Only if component requires engine/interface bindings
- `@withTailwindStyles` - Only for shadow DOM components with Tailwind styles

**Multi-word properties:** Use kebab-case attributes explicitly:
```typescript
@property({type: String, attribute: 'entity-to-greet'}) entityToGreet: string;
```

**Light DOM components:** Extend `LightDomMixin(LitElement)` or `LightDomMixin(InitializeBindingsMixin(LitElement))`

**Initializable components:** Implement `InitializableComponent<BindingsType>` for components requiring initialization

**Architecture preference:** Decorators > Mixins > Lit reactive controllers (use controllers when they provide clear lifecycle/state management benefits)

### Class Field Declaration Order

Declare class fields in this order:

1. `static styles` - Immediately after class declaration
2. `@property` decorated fields (public properties)
3. `@state` decorated fields:
   - `bindings` (for initializable components requiring engine/interface bindings)
   - `error` (for initializable components)
   - Controller-bound state using `@bindStateToController`
   - Other public state
   - Private state
4. Non-decorated fields (controllers, refs, etc.)

**Controller-bound state pattern:**
```typescript
@bindStateToController('querySummary')
@state()
public querySummaryState!: QuerySummaryState;
public querySummary!: QuerySummary;
```

**Example structure:**
```typescript
export class AtomicExample extends LitElement {
  static styles = css`...`;
  
  @property({type: String}) label = 'default';
  
  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @bindStateToController('controller')
  @state()
  public controllerState!: ControllerState;
  public controller!: Controller;
  @state() private isOpen = false;
  
  private myRef = createRef<HTMLElement>();
}
```

### Method declaration order

Declare component methods in the following order:

1. Standard custom element lifecycle method overrides:
    1. `constructor`
    2. `connectedCallback`
    3. `disconnectedCallback` - Always call `super.disconnectedCallback()` first, then clean up event listeners and resources
    4. `adoptedCallback`
    5. `attributeChangedCallback`
2. Public methods / getters (`initialize`  method first, then in alphabetical order)
3. Lit reactive update lifecycle method overrides:
    1. `shouldUpdate`
    2. `willUpdate`
    3. `update`
    4. `render`
    5. `firstUpdated`
    6. `updated`
4. Private methods / getters, in any order

### Event Listener Lifecycle

Register custom event listeners in `initialize()` for initializable components. Always remove them in `disconnectedCallback()` to prevent memory leaks.

**Pattern:**
```typescript
public initialize() {
  this.controller = buildController(this.bindings.engine);
  this.addEventListener('custom-event', this.handleEvent as EventListener);
}

disconnectedCallback() {
  super.disconnectedCallback();
  this.removeEventListener('custom-event', this.handleEvent as EventListener);
}
```

### Property validation

Use `ValidatePropsController` in `constructor` for validation. Boolean props don't require validation.

**Example:**
```typescript
constructor() {
  super();
  
  new ValidatePropsController(
    this,
    () => ({pathLimit: this.pathLimit}),
    new Schema({
      pathLimit: new NumberValue({min: 1, required: false}),
    })
  );
}
```

### Rendering with Lit Directives

**Use Lit directives for conditional rendering** instead of ternaries or manual `if` statements:

- `when(condition, trueTemplate, falseTemplate)` - Conditional rendering
- `classMap(obj)` - Conditional CSS classes
- `nothing` - Render nothing (import from `lit`)

**Example:**
```typescript
import {when} from 'lit/directives/when.js';
import {nothing} from 'lit';

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

## Storybook Integration

**All new and modified Atomic components MUST have Storybook stories.** Use the Storybook MCP tools for story management:

### Story Creation Requirements

- **Always create stories** for new components following the boilerplate pattern in `atomic-name.new.stories.tsx`
- **Update existing stories** when modifying component APIs or behavior
- **Use MCP tools** to generate proper story URLs for testing and documentation
- **Follow Storybook conventions** as outlined in the UI building instructions

### MCP Tool Integration

**After any component changes:**
1. Use `mcp_storybook_get-story-urls` tool to generate story links for visual inspection
2. Provide story URLs to users for component validation
3. Ensure all component variants are covered in stories
