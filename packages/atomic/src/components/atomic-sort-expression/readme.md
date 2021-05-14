# atomic-sort-expression



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Type     | Default     |
| ------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| `caption` _(required)_    | `caption`    | The non-localized caption to display for this expression.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `string` | `undefined` |
| `expression` _(required)_ | `expression` | One or more sort criteria that the end user can select or toggle between.  The available sort criteria are: - `relevancy` - `date ascending`/`date descending` - `qre` - `<FIELD> ascending`/`<FIELD> descending`, where you replace `<FIELD>` with the name of a sortable field in your index (e.g., `criteria="size ascending"`).  You can specify multiple sort criteria to be used in the same request by separating them with a comma (e.g., `criteria="size ascending, date ascending"`). | `string` | `undefined` |


## Dependencies

### Depends on

- [atomic-component-error](../atomic-component-error)

### Graph
```mermaid
graph TD;
  atomic-sort-expression --> atomic-component-error
  style atomic-sort-expression fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
