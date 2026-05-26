# Headless Integration & Component Lifecycle

This reference covers scaffolding, headless engine integration, error handling, property validation, store registration, and shared utilities.

---

## Scaffolding a New Component

### Full dev environment setup

Before developing or running E2E tests you need a Salesforce scratch org. From `packages/quantic`, run:

```bash
# Creates both scratch orgs (LWS enabled + LWS disabled) and deploys everything
pnpm run setup:examples
```

This creates two scratch orgs:

- `Quantic__LWS_enabled` — Lightning Web Security enabled
- `Quantic__LWS_disabled` — Locker Service enabled (LWS disabled)

After the script completes, a `.env` file is generated with the community URLs.

### Creating the component bundle

To create a new Lightning Web Component bundle, run from `packages/quantic`:

```bash
sf lightning generate component --type lwc --name <componentName> --output-dir force-app/main/default/lwc
```

> **Never create the component files manually.** The `sf` command ensures new components always use the latest configured version. Manually created `.js-meta.xml` files risk using an outdated version.

---

## Headless Integration

### Import pattern

```javascript
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
```

### Full lifecycle integration

```javascript
connectedCallback() {
  registerComponentForInit(this, this.engineId);
  // Register event listeners here
}

renderedCallback() {
  initializeWithHeadless(this, this.engineId, this.initialize);
}

/** @param {SearchEngine} engine */
initialize = (engine) => {
  this.headless = getHeadlessBundle(this.engineId);
  this.controller = this.headless.buildSearchBox(engine, {
    options: { /* ... */ },
  });
  this.unsubscribe = this.controller.subscribe(() => this.updateState());
};

disconnectedCallback() {
  this.unsubscribe?.();
  // Remove event listeners here
}
```

### Multiple controllers

Most components also build a `searchStatus` controller (and sometimes others). Name unsubscribe functions `this.unsubscribeXxx` and clean them all up with `?.()` in `disconnectedCallback`. Each controller can have its own state updater (e.g. `updateSearchStatusState`). See any facet or result list component for a working example.

### Type definitions

Import headless types via `@typedef` JSDoc comments placed between the imports and the class declaration. This enables IDE autocompletion and type checking for controllers and state objects:

```javascript
/** @typedef {import("coveo").Pager} Pager */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
```

Use these types in `@type` annotations on instance fields and `@param` on methods.

---

## Error Handling

All headless-bound components use a consistent error pattern:

```javascript
hasInitializationError = false;

setInitializationError() {
  this.hasInitializationError = true;
}
```

In templates:

```html
<template lwc:if="{hasInitializationError}">
  <c-quantic-component-error component-name="{template.host.localName}">
  </c-quantic-component-error>
</template>
```

`setInitializationError` is called automatically by `initializeWithHeadless` when the engine fails to initialize.

---

## Property Validation (Bueno)

Components that accept user-supplied `@api` properties (strings, numbers) must validate them at initialization using the Bueno validation library.

### Import

```javascript
import {getBueno} from 'c/quanticHeadlessLoader';
```

### Validation pattern

Call `getBueno(this)` in `connectedCallback` (before headless initialization). Bueno loads as a static resource, so validation is async:

```javascript
connectedCallback() {
  registerComponentForInit(this, this.engineId);
  getBueno(this).then(() => {
    if (!Bueno.isString(this.field)) {
      console.error(
        `The ${this.template.host.localName} requires a valid string "field" attribute.`
      );
      this.setInitializationError();
    }
  });
}
```

### Key rules

- Always identify the component in error messages via `this.template.host.localName`
- Use `Bueno.isString()` for string props, `Bueno.isNumber()` for numeric props
- Call `this.setInitializationError()` on validation failure — do not throw
- Use `console.error` for fatal validation failures, `console.warn` for non-fatal configuration warnings
- After validation completes, set a `this.validated = true` flag if the component conditionally renders based on validation state

---

## Store Registration

Facet components register themselves in a global metadata store so that other components (e.g. `quanticBreadcrumbManager`, `quanticRefineModalContent`) can discover which facets exist at runtime.

### Import

```javascript
import {registerToStore} from 'c/quanticHeadlessLoader';
import {Store} from 'c/quanticUtils';
```

### Registration pattern

Call `registerToStore` inside `initialize`, after building the controller:

```javascript
initialize = (engine) => {
  this.headless = getHeadlessBundle(this.engineId);
  this.facet = this.headless.buildFacet(engine, {options: {field: this.field}});
  this.unsubscribe = this.facet.subscribe(() => this.updateState());

  registerToStore(this.engineId, Store.facetTypes.FACETS, {
    label: this.label,
    facetId: this.facet.state.facetId ?? this.field,
    format: this.formattingFunction,
    element: this.template.host,
  });
};
```

### `static attributes`

Facet components also declare a `static attributes` array listing all `@api` property names. This enables runtime discovery of supported configuration options.

---

## Shared Utilities

Two shared LWC modules provide reusable functionality. Explore their source for full API details.

**`c/quanticUtils`** — Exports: `AriaLiveRegion`, `I18nUtils`, `Debouncer`, `Deferred`, `ResultUtils`, `LinkUtils`, `Store`, `getAbsoluteHeight`, `copyToClipboard`, `getItemFromLocalStorage`, `setItemInLocalStorage`. Also re-exports sub-modules: `recentQueriesUtils`, `markdownUtils`, `facetDependenciesUtils`, `citationAnchoringUtils`, `timeAndDateUtils`.

**`c/quanticHeadlessLoader`** — Exports: `registerComponentForInit`, `initializeWithHeadless`, `getHeadlessBundle`, `registerToStore`, `getBueno`.
