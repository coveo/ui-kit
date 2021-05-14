# atomic-facet

A facet component. It is displayed as a facet in desktop browsers and as a button which opens a facet modal in mobile browsers.

<!-- Auto Generated Below -->


## Properties

| Property              | Attribute              | Description                                                                                                                                                                                                    | Type                                                        | Default       |
| --------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------- |
| `delimitingCharacter` | `delimiting-character` | The character that separates values of a multi-value field.                                                                                                                                                    | `string`                                                    | `';'`         |
| `enableFacetSearch`   | `enable-facet-search`  | Whether this facet should contain a search box.                                                                                                                                                                | `boolean`                                                   | `true`        |
| `facetId`             | `facet-id`             | Specifies a unique identifier for the facet                                                                                                                                                                    | `string`                                                    | `''`          |
| `field`               | `field`                | The field whose values you want to display in the facet.                                                                                                                                                       | `string`                                                    | `''`          |
| `label`               | `label`                | The non-localized label for the facet.                                                                                                                                                                         | `string`                                                    | `'noLabel'`   |
| `numberOfValues`      | `number-of-values`     | The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed. | `number`                                                    | `8`           |
| `sortCriteria`        | `sort-criteria`        | The sort criterion to apply to the returned facet values. Possible values are 'score', 'numeric', 'occurrences', and 'automatic'.                                                                              | `"alphanumeric" \| "automatic" \| "occurrences" \| "score"` | `'automatic'` |


## Shadow Parts

| Part                          | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| `"active-search-result"`      | The currently active search result                                 |
| `"clear-button"`              | The button that resets the actively selected facet values          |
| `"close-button"`              | The button to close the facet when displayed modally (mobile only) |
| `"facet"`                     | The wrapper for the entire facet                                   |
| `"label"`                     | The label of the facet                                             |
| `"modal-button"`              | The button to open the facet modal (mobile only)                   |
| `"placeholder"`               | The placeholder shown before the first search is executed.         |
| `"search-icon"`               | The magnifier icon of the input                                    |
| `"search-input"`              | The search input                                                   |
| `"search-input-clear-button"` | The clear button of the input                                      |
| `"search-no-results"`         | The label displayed when a search returns no results               |
| `"search-result"`             | A search result                                                    |
| `"search-results"`            | The list of search results                                         |
| `"show-less"`                 | The show less button                                               |
| `"show-more"`                 | The show more results button                                       |
| `"value"`                     | A single facet value                                               |
| `"value-count"`               | The facet value count                                              |
| `"value-label"`               | The facet value label                                              |


## Dependencies

### Depends on

- [atomic-component-error](../../atomic-component-error)

### Graph
```mermaid
graph TD;
  atomic-facet --> atomic-component-error
  style atomic-facet fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
