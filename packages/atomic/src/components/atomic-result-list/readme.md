# atomic-result-list



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description                                                            | Type     | Default |
| ----------------- | ------------------- | ---------------------------------------------------------------------- | -------- | ------- |
| `fieldsToInclude` | `fields-to-include` | A list of fields to include in the query results, separated by commas. | `string` | `''`    |


## Shadow Parts

| Part             | Description      |
| ---------------- | ---------------- |
| `"list-element"` | The list element |


## Dependencies

### Depends on

- [atomic-result](../atomic-result)
- [atomic-component-error](../atomic-component-error)

### Graph
```mermaid
graph TD;
  atomic-result-list --> atomic-result
  atomic-result-list --> atomic-component-error
  style atomic-result-list fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
