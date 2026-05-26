# UI Patterns: Labels, Templates, CSS & Events

This reference covers label management, template directives, CSS conventions, event patterns, and multi-template rendering.

---

## Label Management

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

When a label needs different text based on count (e.g., "1 result" vs. "2 results" vs. "No results"), define three label variants using the suffixes ``, `\_plural`, and `\_zero`, then use `I18nUtils.getLabelNameWithCount()` to select the right one:

Define three label variants in `CustomLabels.labels-meta.xml` with suffixes: base (singular), `_plural`, and `_zero`. Then import and group all three:

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

### Label definition & translations

Add labels to `force-app/main/default/labels/CustomLabels.labels-meta.xml` (follow the existing `<labels>` structure). Every new label **must** also have a `<customLabels>` translation entry appended to **both**:

- `force-app/main/translations/fr.translation-meta.xml`
- `force-app/main/translations/es.translation-meta.xml`

Examine existing entries for the exact XML structure.

---

## Template Patterns

### Conditional rendering

Use `lwc:if` / `lwc:elseif` / `lwc:else` for top-level conditional branches:

> Note: the `<!-- prettier-ignore -->` below is a markdown formatting directive only — do not include it in real templates.

<!-- prettier-ignore -->
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

> Note: the `<!-- prettier-ignore -->` below is a markdown formatting directive only — do not include it in real templates.

<!-- prettier-ignore -->
```html
<c-quantic-feedback
  state={feedbackState}
  onquantic__like={handleLike}
  onquantic__dislike={handleDislike}
></c-quantic-feedback>
```

### SLDS utility classes

**Always use SLDS utility classes first.** Write custom CSS only when no SLDS class achieves the needed result. Use `slds-assistive-text` for visually-hidden screen-reader text and `slds-current-color` on `lightning-icon` to inherit parent color. For grid, spacing, and typography classes, reference existing components or the [SLDS documentation](https://www.lightningdesignsystem.com/utilities/).

---

## CSS Patterns

### Naming convention

BEM-like with component prefix and double-dash modifiers:

```css
.generated-answer__answer {
}
.generated-answer__answer--collapsed {
}
.generated-answer__card-header {
}
```

### Custom properties (SLDS design tokens)

Always include a CSS fallback value when using `var(--lwc-*)` tokens — they are not guaranteed to be available in every environment (e.g. communities, embedded contexts):

```css
color: var(--lwc-brandPrimary, #1b96ff);
background-color: var(--lwc-colorBackgroundAlt, #fff);
border-radius: var(--lwc-borderRadiusMedium, 0.25rem);
padding: var(--lwc-spacingSmall, 0.5rem);
```

### Shared CSS imports

```css
@import 'c/quanticFacetStyles';
@import '../quanticGeneratedAnswer.css';
```

---

## Event Patterns

### Naming convention

Custom events use `quantic__` prefix (double underscore, all lowercase):

```
quantic__like
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

### `bubbles` vs `composed`

Events that stay within the immediate parent-child component tree need only `bubbles: true`:

```javascript
new CustomEvent('quantic__tabrendered', {bubbles: true});
```

Events that must cross shadow DOM boundaries (e.g. `quantic__renderfacet` dispatched by a facet and consumed by a parent interface component) need **both** `bubbles: true` and `composed: true`:

```javascript
new CustomEvent('quantic__renderfacet', {
  detail: {id: this.facetId ?? this.field, shouldRenderFacet: this.hasValues},
  bubbles: true,
  composed: true,
});
```

The `quantic__arialivemessage` and `quantic__registerregion` events from `AriaLiveRegion` also use `composed: true` so they can reach the interface component.

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

## Multi-Template Components

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
