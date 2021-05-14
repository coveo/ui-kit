# atomic-text



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute | Description                       | Type                  | Default     |
| -------------------- | --------- | --------------------------------- | --------------------- | ----------- |
| `count`              | `count`   | The count value used for plurals. | `number \| undefined` | `undefined` |
| `value` _(required)_ | `value`   | The string key value.             | `string`              | `undefined` |


## Dependencies

### Used by

 - [atomic-result-text](../result-template-components/atomic-result-text)

### Depends on

- [atomic-component-error](../atomic-component-error)

### Graph
```mermaid
graph TD;
  atomic-text --> atomic-component-error
  atomic-result-text --> atomic-text
  style atomic-text fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
