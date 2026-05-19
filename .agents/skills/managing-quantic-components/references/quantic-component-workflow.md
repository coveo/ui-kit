# Quantic Component Workflow

This file is loaded when creating, implementing, or substantially modifying a Quantic component. For a quick overview of conventions, see `SKILL.md`.

---

## Table of Contents

0. [Scaffolding a New Component](#0-scaffolding-a-new-component)
1. [Component Class Structure](#1-component-class-structure)
2. [Headless Integration](#2-headless-integration)
3. [Label Management](#3-label-management)
4. [Template Patterns](#4-template-patterns)
5. [CSS Patterns](#5-css-patterns)
6. [Event Patterns](#6-event-patterns)
7. [Error Handling](#7-error-handling)
8. [Multi-Template Components](#8-multi-template-components)
9. [Meta XML](#9-meta-xml)
10. [Documentation Requirements](#10-documentation-requirements)
11. [Unit Test Patterns](#11-unit-test-patterns)
12. [Shared Utilities](#12-shared-utilities)
13. [End-to-End Testing](#13-end-to-end-testing)

---

## 0. Scaffolding a New Component

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

To deploy only specific source after initial setup:

```bash
# Deploy production components to a specific org
pnpm run deploy:main Quantic__LWS_enabled

# Deploy example components to a specific org
pnpm run deploy:examples Quantic__LWS_enabled
```

### Creating the component bundle

To create a new Lightning Web Component bundle, run from `packages/quantic`:

```bash
sf lightning generate component --type lwc --name <componentName> --output-dir force-app/main/default/lwc
```

> **Never create the component files manually.** The `sf` command ensures new components always use the latest configured version. Manually created `.js-meta.xml` files risk using an outdated version.

---

## 1. Component Class Structure

### Base class

All Quantic components extend `LightningElement`:

```javascript
import {LightningElement, api} from 'lwc';

export default class QuanticComponentName extends LightningElement {
  // ...
}
```

### Decorators

- **`@api`** — Public properties for parent-to-child data flow
- **`@track`** — Deep reactive tracking (only needed for objects/arrays; primitives are reactive by default in modern LWC)

---

## 2. Headless Integration

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

### Type definitions

Import headless types via `@typedef` JSDoc comments placed between the imports and the class declaration. This enables IDE autocompletion and type checking for controllers and state objects:

```javascript
/** @typedef {import("coveo").Pager} Pager */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
```

Use these types in `@type` annotations on instance fields and `@param` on methods:

```javascript
/** @type {Pager} */
pager;

/** @param {SearchEngine} engine */
initialize = (engine) => { /* ... */ };
```

---

## 3. Label Management

**Every string visible to the user must be a localized label.** Never hardcode user-facing text in templates or JS files.

### Import pattern

```javascript
import labelName from '@salesforce/label/c.quantic_LabelName';
```

### Grouping labels

All labels are grouped into a single `labels` instance property:

```javascript
labels = {
  generatedAnswerForYou,
  thisAnswerWasNotHelpful,
  thisAnswerWasHelpful,
};
```

Reference in templates via `{labels.propertyName}`.

### Interpolating variables into labels

When a label contains placeholders (`{{0}}`, `{{1}}`, etc.), always use `I18nUtils.format()` to substitute values. **Never use `.replace()` or string concatenation on labels.**

```javascript
import {I18nUtils} from 'c/quanticUtils';

// Label value: "Showing {{0}} of {{1}} results"
get showingResultsLabel() {
  return I18nUtils.format(this.labels.showingResultsOf, this.first, this.total);
}
```

Arguments are positional and map to `{{0}}`, `{{1}}`, etc.

### Plural, singular, and zero label variants

When a label needs different text based on count (e.g., "1 result" vs. "2 results" vs. "No results"), define three label variants using the suffixes ``, `_plural`, and `_zero`, then use `I18nUtils.getLabelNameWithCount()` to select the right one:

**Label definitions:**
```xml
<!-- singular (no suffix) -->
<fullName>quantic_InclusionFilter</fullName>
<value>Inclusion filter on {{0}}; {{1}} result</value>

<!-- plural -->
<fullName>quantic_InclusionFilter_plural</fullName>
<value>Inclusion filter on {{0}}; {{1}} results</value>

<!-- zero -->
<fullName>quantic_InclusionFilter_zero</fullName>
<value>Inclusion filter on {{0}}; no results</value>
```

**Import and group all three variants:**
```javascript
import inclusionFilter from '@salesforce/label/c.quantic_InclusionFilter';
import inclusionFilter_plural from '@salesforce/label/c.quantic_InclusionFilter_plural';
import inclusionFilter_zero from '@salesforce/label/c.quantic_InclusionFilter_zero';

labels = {
  inclusionFilter,
  inclusionFilter_plural,
  inclusionFilter_zero,
};
```

**Select the correct variant by count, then format:**
```javascript
get inclusionFilterLabel() {
  const labelName = I18nUtils.getLabelNameWithCount('inclusionFilter', this.count);
  return I18nUtils.format(this.labels[labelName], this.value, this.count);
}
```

`getLabelNameWithCount(baseName, count)` returns `baseName` (singular), `baseName_plural`, or `baseName_zero` based on the count. All three translation variants must also be added to both translation files.

### Naming convention

Salesforce custom label names use the prefix `quantic_` followed by PascalCase: `quantic_GeneratedAnswerForYou`.

### Label definition (CustomLabels.labels-meta.xml)

```xml
<labels>
  <fullName>quantic_LabelName</fullName>
  <value>Display text</value>
  <language>en_US</language>
  <protected>false</protected>
  <shortDescription>Short description</shortDescription>
</labels>
```

### Translations

Every new label **must** have a corresponding translation entry added to **both** translation files:

- `force-app/main/translations/fr.translation-meta.xml` — French
- `force-app/main/translations/es.translation-meta.xml` — Spanish

Add a `<customLabels>` block for each file:

```xml
<customLabels>
  <label>Translated text</label>
  <name>quantic_LabelName</name>
</customLabels>
```

Append the new entry to the end of the existing `<customLabels>` list in each file, preserving  insertion order.

---

## 4. Template Patterns

### Conditional rendering

Use `lwc:if` / `lwc:elseif` / `lwc:else` for top-level conditional branches:

```html
<template lwc:if={hasInitializationError}>
  <c-quantic-component-error></c-quantic-component-error>
</template>
<template lwc:else>
  <!-- Normal content -->
</template>
```

> ⚠️ Legacy `if:true` / `if:false` directives exist in older components but must **not** be used in new code.


### Child component references

Child Quantic components use the `c-` prefix with kebab-case:

```html
<c-quantic-feedback
  state={feedbackState}
  onquantic__like={handleLike}
  onquantic__dislike={handleDislike}
></c-quantic-feedback>
```

### SLDS utility classes

**Always use SLDS utility classes first. Write custom CSS only when no SLDS class achieves the needed result.**

The following are commonly used classes:

| Purpose | Examples |
|---|---|
| Grid layout | `slds-grid`, `slds-col`, `slds-wrap`, `slds-gutters` |
| Grid alignment | `slds-grid_vertical-align-center`, `slds-grid_align-center`, `slds-grid_align-end`, `slds-grid_vertical`, `slds-col_bump-left` |
| Sizing | `slds-size_1-of-1`, `slds-size_12-of-12`, `slds-size_5-of-6`, `slds-shrink-none` |
| Margin | `slds-var-m-top_medium`, `slds-var-m-bottom_small`, `slds-var-m-around_xxx-small`, `slds-var-m-vertical_x-small`, `slds-var-m-right_xx-small` |
| Padding | `slds-p-horizontal_x-small`, `slds-p-around_x-small`, `slds-var-p-vertical_x-small`, `slds-var-p-horizontal_medium` |
| Typography | `slds-text-title_bold`, `slds-text-heading_small`, `slds-text-body_small`, `slds-text-align_center`, `slds-truncate` |
| Text color | `slds-text-color_weak`, `slds-text-color_destructive`, `slds-text-color_default`, `slds-text-color_error` |
| Containers | `slds-box`, `slds-border_bottom`, `slds-has-dividers_around-space` |
| Positioning | `slds-is-relative`, `slds-is-absolute`, `slds-float_right`, `slds-align_absolute-center` |
| Accessibility | `slds-assistive-text` (visually hidden, screen-reader-only text) |
| Icons | `slds-current-color` on `lightning-icon` to inherit parent color |

---

## 5. CSS Patterns

### Naming convention

BEM-like with component prefix and double-dash modifiers:

```css
.generated-answer__answer { }
.generated-answer__answer--collapsed { }
.generated-answer__answer--expanded { }
.generated-answer__card-header { }
```

### Custom properties (SLDS design tokens)

```css
color: var(--lwc-brandPrimary, #1b96ff);
background-color: var(--lwc-colorBackgroundAlt, #fff);
border-radius: var(--lwc-borderRadiusMedium, 0.25rem);
padding: var(--lwc-spacingSmall, 0.5rem);
```

### Shared CSS imports

```css
@import 'c/quanticFacetStyles';
@import 'c/searchBoxStyle';
@import '../quanticGeneratedAnswer.css';
```

---

## 6. Event Patterns

### Naming convention

Custom events use `quantic__` prefix (double underscore, all lowercase):

```
quantic__like
quantic__dislike
quantic__inputvaluechange
quantic__selectvalue
```

### Dispatch

```javascript
this.dispatchEvent(
  new CustomEvent('quantic__askfollowup', {
    detail: {question: trimmed},
    bubbles: true,
  })
);
```

### Listening

Register in `connectedCallback`, remove in `disconnectedCallback`:

```javascript
connectedCallback() {
  this.template.addEventListener('quantic__eventname', this.handleEvent);
}

disconnectedCallback() {
  this.template.removeEventListener('quantic__eventname', this.handleEvent);
}
```

Event handlers registered via `addEventListener` must be **arrow functions** to preserve `this`:

```javascript
handleEvent = (event) => {
  event.stopPropagation();
  // ...
};
```

---

## 7. Error Handling

All headless-bound components use a consistent error pattern:

```javascript
hasInitializationError = false;

setInitializationError() {
  this.hasInitializationError = true;
}
```

In templates:

```html
<template lwc:if={hasInitializationError}>
  <c-quantic-component-error component-name={template.host.localName}>
  </c-quantic-component-error>
</template>
```

`setInitializationError` is called automatically by `initializeWithHeadless` when the engine fails to initialize.

---

## 8. Multi-Template Components

Components with multiple visual states override `render()`:

```javascript
// @ts-ignore
import errorTemplate from './templates/errorTemplate.html';
// @ts-ignore
import mainTemplate from './templates/main.html';
// @ts-ignore
import loadingTemplate from './templates/loading.html';

render() {
  if (this.hasInitializationError) return errorTemplate;
  if (this.isLoading) return loadingTemplate;
  return mainTemplate;
}
```

### Key rules

- Template imports use `// @ts-ignore` because LWC template imports are not recognized by TypeScript
- Each template can have its own scoped `.css` file alongside it in `templates/`
- Shared CSS is imported via `@import '../componentName.css'` in template-scoped CSS files
- Multi-template components have **no root `.html` file** — all templates live under `templates/`
- `render()` is always the **last method** in the class

---

## 9. Meta XML

> The `.js-meta.xml` file is automatically generated by the `sf lightning generate component` command (see [Scaffolding a New Component](#0-scaffolding-a-new-component)). The generated file already contains the correct `apiVersion`, so manual creation is rarely needed.

All Quantic components use a minimal metadata configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>58.0</apiVersion>
    <isExposed>false</isExposed>
</LightningComponentBundle>
```

- `isExposed` is `false` for all components
- No `targets` or `targetConfigs` are defined

---

## 10. Documentation Requirements

Quantic reference docs are generated from component JSDoc. Keep descriptions short, specific, and focused on what consumers need to know.

### Component class JSDoc

```javascript
/**
 * The `QuanticComponentName` component [description].
 * @category Search
 * @fires quantic__eventname
 * @slot slot-name - Description of the slot.
 * @example
 * <c-quantic-component-name engine-id={engineId} with-toggle></c-quantic-component-name>
 */
```

**Valid categories**: `Search`, `Case Assist`, `Insight Panel`, `Internal`, `Result Template`, `Recommendation`, `Utility`

### Type definitions

Place `@typedef` imports between the module imports and the class declaration:

```javascript
/** @typedef {import("coveo").Pager} Pager */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
```

### Property JSDoc

Every `@api` property must have a JSDoc comment with:

- Description starting with "The", "A", "An", or "Whether"
- `@api` tag
- `@type {TypeName}` — explicit type
- `@defaultValue` — default value (when applicable)

```javascript
/**
 * Whether the generated answer can be toggled on or off.
 * @api
 * @type {boolean}
 * @defaultValue {false}
 */
@api withToggle = false;
```

Match existing Quantic wording and formatting conventions instead of introducing a new documentation style.

### Method JSDoc

Add `@param` and `@returns` JSDoc to methods and getters that handle typed data:

```javascript
/**
 * @param {CustomEvent<number>} event
 */
goto(event) {
  this.pager.selectPage(event.detail);
}

/**
 * @returns {Array<{number: number, selected: boolean, ariaLabelValue: string}>}
 */
get currentPagesObjects() { /* ... */ }
```

---

## 11. Unit Test Patterns

> **When to write unit tests vs. E2E tests**: Jest unit tests cover isolated component behavior (rendering, property updates, mocked headless state, edge cases). E2E Playwright tests cover real user workflows and external system interactions. For the full decision rationale, see [packages/quantic/decisions/0001-testing-strategy.md](../../../decisions/0001-testing-strategy.md).

### File location

```
__tests__/
  quanticComponentName.test.js
```

### Test setup

```javascript
import QuanticComponent from 'c/quanticComponent';
import {cleanup, flushPromises, buildCreateTestComponent} from 'c/testUtils';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

const defaultOptions = {engineId: 'engineId'};
const createComponent = buildCreateTestComponent(
  QuanticComponent,
  'c-quantic-component',
  defaultOptions
);

afterEach(() => {
  cleanup();
});
```

### Running unit tests

To run the unit tests for a specific component, from `packages/quantic`:

```bash
pnpm run test:unit <componentName>.test.js
# Example:
pnpm run test:unit quanticPager.test.js
```

### Selectors

Use `data-testid` attributes as test selectors — never select by SLDS class names, tag names, or DOM position. This keeps tests stable when the UI changes.

```html
<lightning-button data-testid="previous-button" onclick={previous}></lightning-button>
```

```javascript
const button = element.shadowRoot.querySelector('[data-testid="previous-button"]');
```

### Key test utilities (from `c/testUtils`)

| Utility | Purpose |
|---|---|
| `buildCreateTestComponent(Component, tag, defaults)` | Factory to create component instances |
| `cleanup()` | Clears DOM and resets mocks between tests |
| `flushPromises()` | Awaits all pending microtasks |

---

## 12. Shared Utilities

### `c/quanticUtils`

| Export | Purpose |
|---|---|
| `AriaLiveRegion` | Accessibility live region announcements |
| `I18nUtils` | Label formatting: `format`, `getTextBold`, `getLabelNameWithCount` |
| `Debouncer` | Debounce function calls |
| `Deferred` | Promise wrapper with external resolve/reject |
| `ResultUtils` | Bind click analytics on result elements |
| `LinkUtils` | Bind analytics to links |
| `Store` | Global state management across components |
| `getAbsoluteHeight` | DOM element height measurement |
| `copyToClipboard` | Clipboard API wrapper |

Also re-exports utilities from sub-modules: `recentQueriesUtils`, `markdownUtils`, `facetDependenciesUtils`, `citationAnchoringUtils`, `timeAndDateUtils`.

### `c/quanticHeadlessLoader`

| Export | Purpose |
|---|---|
| `registerComponentForInit(element, engineId)` | Register for headless initialization |
| `initializeWithHeadless(element, engineId, callback)` | Trigger initialization |
| `getHeadlessBundle(engineId)` | Get the headless library bundle |
| `registerToStore(element, engineId)` | Register component in global store |
| `getBueno(element)` | Get the Bueno validation library |

---

## 13. End-to-End Testing

> **When to write E2E tests vs. unit tests**: Playwright E2E tests focus on user workflows, real API interactions, browser-specific behaviors, and cross-component integration. They complement — not duplicate — Jest unit tests. For the full decision rationale, see [packages/quantic/decisions/0001-testing-strategy.md](../../../decisions/0001-testing-strategy.md).

E2E tests for Quantic components run against the **Quantic Examples** Salesforce community, which acts as a live playground. The overall flow is:

1. **Create an example component** — Build an `exampleQuantic<ComponentName>` LWC under `force-app/examples/main/lwc/`. It wires together `c-example-layout`, `c-configurator` (for property controls), and the component under test. This page is what the E2E tests will navigate to.
2. **Deploy and publish** — Deploy the example to a scratch org (see [Scaffolding a New Component](#0-scaffolding-a-new-component)) and publish the community so the page is reachable by Playwright.
3. **Write the test suite** — Each component has an `e2e/` folder alongside its source with three files:
   - `fixture.ts` — Extends `quanticBase` to navigate to the page, configure options, and expose the page object.
   - `pageObject.ts` — Encapsulates Playwright locators and interactions for the component.
   - `<componentName>.e2e.ts` — The actual test cases using the fixture and page object.

### Shared Playwright infrastructure

`quanticBase` (from `playwright/fixtures/baseFixture.ts`) provides these fixtures to all E2E tests:

| Fixture | Purpose |
|---|---|
| `configuration` | `ConfigurationObject` — fills the configurator form and clicks "Try it now" |
| `analytics` | `AnalyticsObject` — waits for and asserts UA/next-gen analytics requests |
| `analyticsMode` | `legacy` (default) or `next` — controls which analytics protocol is expected |

Use `analytics.waitForClickUaAnalytics(actionCause)` or `analytics.waitForCustomUaAnalytics({eventType, eventValue})` to assert analytics calls in tests.

For facet components, extend `BaseFacetObject` (from `playwright/page-object/baseFacetObject.ts`) which adds `waitForFacetSearchResponse()`, `mockSearchWithFacetResponse()`, and facet-specific UA event helpers.

### Running E2E tests

From `packages/quantic`:

```bash
# Run all E2E tests
npx playwright test

# Run only LWS-enabled tests
npx playwright test --project=LWS-enabled

# Run only LWS-disabled tests
npx playwright test --project=LWS-disabled
```

For the full step-by-step walkthrough and example code, see [packages/quantic/docs/adding-tests.md](../../../docs/adding-tests.md).