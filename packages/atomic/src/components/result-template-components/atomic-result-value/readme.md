# atomic-result-value



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute               | Description | Type                                                                                                                                     | Default     |
| --------------------- | ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `shouldHighlightWith` | `should-highlight-with` |             | `"excerptHighlights" \| "firstSentencesHighlights" \| "printableUriHighlights" \| "summaryHighlights" \| "titleHighlights" \| undefined` | `undefined` |
| `value`               | `value`                 |             | `string`                                                                                                                                 | `''`        |


## Dependencies

### Used by

 - [atomic-result-excerpt](../atomic-result-excerpt)

### Depends on

- [atomic-component-error](../../atomic-component-error)

### Graph
```mermaid
graph TD;
  atomic-result-value --> atomic-component-error
  atomic-result-excerpt --> atomic-result-value
  style atomic-result-value fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
