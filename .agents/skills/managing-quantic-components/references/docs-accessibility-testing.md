# Documentation, Accessibility & Testing

This reference covers JSDoc documentation requirements, AriaLiveRegion accessibility patterns, and the testing strategy.

---

## Documentation Requirements

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

## Accessibility — AriaLiveRegion

Components that announce status changes to screen readers (results loaded, errors, loading states) use the `AriaLiveRegion` utility. Messages propagate up to the interface component (`quanticSearchInterface`, `quanticInsightInterface`, or `quanticRecommendationInterface`) which renders `aria-live` regions in the DOM.

### Import

```javascript
import {AriaLiveRegion} from 'c/quanticUtils';
```

### Usage pattern

Create the region inside `initialize`, then dispatch messages in state updaters:

```javascript
initialize = (engine) => {
  this.headless = getHeadlessBundle(this.engineId);
  this.controller = this.headless.buildResultList(engine);
  this.unsubscribe = this.controller.subscribe(() => this.updateState());

  this.loadingAriaMessage = AriaLiveRegion('loading', this);
  this.resultsAriaMessage = AriaLiveRegion('results', this);
};

updateState() {
  if (this.searchStatus?.state?.isLoading) {
    this.loadingAriaMessage.dispatchMessage(this.labels.loadingResults);
  } else {
    this.resultsAriaMessage.dispatchMessage(this.labels.showingResults);
  }
}
```

### How it works

1. `AriaLiveRegion(regionName, element)` auto-registers by dispatching `quantic__registerregion` (with `composed: true`)
2. `.dispatchMessage(text)` dispatches `quantic__arialivemessage` (with `composed: true`)
3. The interface component's `quanticAriaLive` child receives and renders these in `aria-live` DOM regions

An optional third argument `assertive = true` creates an assertive live region for urgent announcements.

---

## Testing

For the testing strategy rationale, see [packages/quantic/decisions/0001-testing-strategy.md](../../../decisions/0001-testing-strategy.md).

- **Jest unit tests** — Isolated component behavior, rendering, lifecycle, and headless interactions with mocks. When writing tests, examine an existing test file for a similar component and follow its mock scaffolding, selector patterns, and assertion style.
- **Playwright E2E tests** — Real user workflows, analytics, API interactions, and Salesforce integration. See [packages/quantic/docs/adding-tests.md](../../../docs/adding-tests.md) for the full walkthrough.

### Running tests

From `packages/quantic`:

```bash
# Unit tests for a specific component
pnpm run test:unit quanticPager.test.js

# All E2E tests
npx playwright test
```

Do not duplicate upstream Headless coverage unless the Quantic component adds behavior on top.
