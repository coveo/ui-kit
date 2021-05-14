# atomic-result-link



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Type     | Default   |
| -------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| `target` | `target`  | Where to display the linked URL, as the name for a browsing context (a tab, window, or <iframe>).  The following keywords have special meanings: - _self: the current browsing context. (Default) - _blank: usually a new tab, but users can configure their browsers to open a new window instead. - _parent: the parent of the current browsing context. If there's no parent, this behaves as `_self`. - _top: the topmost browsing context (the "highest" context that’s an ancestor of the current one). If there are no ancestors, this behaves as `_self`. | `string` | `'_self'` |


## Slots

| Slot        | Description                                          |
| ----------- | ---------------------------------------------------- |
| `"default"` | Allow to display alternative content inside the link |


## Shadow Parts

| Part            | Description     |
| --------------- | --------------- |
| `"result-link"` | The result link |


## Dependencies

### Depends on

- [atomic-result-text](../atomic-result-text)

### Graph
```mermaid
graph TD;
  atomic-result-link --> atomic-result-text
  atomic-result-text --> atomic-component-error
  atomic-result-text --> atomic-text
  atomic-text --> atomic-component-error
  style atomic-result-link fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
