# atomic-pager



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                   | Description                                                                                                      | Type      | Default |
| ------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `enableNavigationButtons` | `enable-navigation-buttons` | Specifies whether the **Previous** and **Next** buttons should appear at each end of the pager when appropriate. | `boolean` | `true`  |
| `numberOfPages`           | `number-of-pages`           | Specifies how many page buttons to display in the pager.                                                         | `number`  | `5`     |


## Shadow Parts

| Part                   | Description            |
| ---------------------- | ---------------------- |
| `"active-page-button"` | The active page button |
| `"back-button"`        | The back button        |
| `"list"`               | The list of buttons    |
| `"next-button"`        | The next button        |
| `"page-button"`        | The page button        |


## Dependencies

### Depends on

- [atomic-component-error](../atomic-component-error)

### Graph
```mermaid
graph TD;
  atomic-pager --> atomic-component-error
  style atomic-pager fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
