# renderFacetSegmentedValue

A Lit functional component that renders a single segmented facet value for horizontal facet displays.

## Overview

`renderFacetSegmentedValue` is used to display individual facet values in a segmented (horizontal button-style) layout. It's typically used within the `atomic-segmented-facet` component to render each facet option.

## Usage

```typescript
import {renderFacetSegmentedValue} from '@/src/components/common/facets/facet-segmented-value/facet-segmented-value';

// Example usage within a parent component
renderFacetSegmentedValue({
  props: {
    i18n,
    displayValue: 'Electronics',
    numberOfResults: 1234,
    isSelected: false,
    onClick: () => handleValueClick(),
  },
});
```

## Props

### i18n (required)
- **Type:** `i18n`
- **Description:** The i18next instance for internationalization

### displayValue (required)
- **Type:** `string`
- **Description:** The human-readable label to display for the facet value

### numberOfResults (required)
- **Type:** `number`
- **Description:** The count of results associated with this facet value

### isSelected (required)
- **Type:** `boolean`
- **Description:** Whether this facet value is currently selected

### onClick (required)
- **Type:** `() => void`
- **Description:** Callback function invoked when the value is clicked

### searchQuery (optional)
- **Type:** `string`
- **Description:** The current search query, if applicable

## Features

### Compact Count Formatting
The component automatically formats large numbers using compact notation:
- 1,000 displays as "1K"
- 1,500,000 displays as "1.5M"

### Localized Formatting
Both the count display and aria-label use the user's locale for proper number formatting.

### Accessibility
- Proper ARIA label includes the value name and result count
- `aria-pressed` attribute reflects selection state
- Fully keyboard accessible via button element

### Visual States
- **Idle:** Default neutral styling with hover effects
- **Selected:** Primary color styling with inner shadow to indicate active state

## Styling

The component uses Tailwind CSS classes and exposes the following shadow parts for customization:

- `value-box`: The button container
- `value-box-selected`: Additional part applied when selected
- `value-label`: The text label for the facet value
- `value-count`: The count display in parentheses

### CSS Variables
The component respects standard Atomic theme variables:
- `--atomic-primary`: Color for selected state
- `--atomic-primary-light`: Color for hover/focus states
- `--atomic-neutral-dark`: Color for count text

## Related Components

- **atomic-segmented-facet**: Parent component that uses this functional component
- **renderFacetValueBox**: Similar functional component for box-style facet values
- **renderFacetValueCheckbox**: Alternative for checkbox-style facet values
- **renderFacetValueLink**: Alternative for link-style facet values

## Example

```typescript
import {html} from 'lit';
import {renderFacetSegmentedValue} from '@/src/components/common/facets/facet-segmented-value/facet-segmented-value';

// Render multiple segmented values
const values = facetState.values.map((value) =>
  renderFacetSegmentedValue({
    props: {
      i18n,
      displayValue: value.value,
      numberOfResults: value.numberOfResults,
      isSelected: value.state !== 'idle',
      onClick: () => handleToggleSelect(value),
    },
  })
);

return html`<ul class="flex h-10">${values}</ul>`;
```

## Migration Notes

This is the Lit version of the component. The deprecated Stencil version (`FacetSegmentedValue`) remains in `src/components/search/facets/facet-segmented-value/` for backward compatibility with Stencil components that haven't been migrated yet.
