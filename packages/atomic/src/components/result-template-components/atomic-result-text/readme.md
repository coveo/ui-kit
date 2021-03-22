# atomic-result-text-value



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute          | Description                                                                                                                                                                                                          | Type                  | Default     |
| -------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| `default`            | `default`          | The locale key for the text to display when the configured field has no value.                                                                                                                                       | `string \| undefined` | `undefined` |
| `field` _(required)_ | `field`            | The result field which the component should use. Will look in the Result object first and then in the Result.raw object for the fields. It is important to include the necessary fields in the ResultList component. | `string`              | `undefined` |
| `shouldHighlight`    | `should-highlight` | If true, will look for the corresponding highlight property use it if available.                                                                                                                                     | `boolean`             | `true`      |


## Shadow Parts

| Part                      | Description                                   |
| ------------------------- | --------------------------------------------- |
| `"result-text-highlight"` | The highlighted elements from the text value. |


## Dependencies

### Used by

 - [atomic-result-link](../atomic-result-link)
 - [atomic-result-printable-uri](../atomic-result-printable-uri)

### Depends on

- [atomic-component-error](../../atomic-component-error)
- [atomic-text](../../atomic-text)

### Graph
```mermaid
graph TD;
  atomic-result-text --> atomic-component-error
  atomic-result-text --> atomic-text
  atomic-text --> atomic-component-error
  atomic-result-link --> atomic-result-text
  atomic-result-printable-uri --> atomic-result-text
  style atomic-result-text fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
