# facet-value



<!-- Auto Generated Below -->


## Properties

| Property                       | Attribute           | Description | Type      | Default     |
| ------------------------------ | ------------------- | ----------- | --------- | ----------- |
| `isSelected` _(required)_      | `is-selected`       |             | `boolean` | `undefined` |
| `label` _(required)_           | `label`             |             | `string`  | `undefined` |
| `numberOfResults` _(required)_ | `number-of-results` |             | `number`  | `undefined` |


## Events

| Event                | Description | Type                |
| -------------------- | ----------- | ------------------- |
| `facetValueSelected` |             | `CustomEvent<void>` |


## Dependencies

### Used by

 - [atomic-date-facet](../atomic-date-facet)
 - [atomic-facet](../atomic-facet)
 - [atomic-numeric-facet](../atomic-numeric-facet)

### Graph
```mermaid
graph TD;
  atomic-date-facet --> facet-value
  atomic-facet --> facet-value
  atomic-numeric-facet --> facet-value
  style facet-value fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
