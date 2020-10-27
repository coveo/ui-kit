# atomic-search-box-input



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute     | Description | Type                                                                                                                                                                                                                                                                                           | Default     |
| ------------------------- | ------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `controller` _(required)_ | --            |             | `{ updateText(value: string): void; clear(): void; hideSuggestions(): void; showSuggestions(): void; selectSuggestion(value: string): void; submit(): void; state: { value: string; suggestions: { value: string; }[]; isLoading: boolean; }; subscribe(listener: () => void): Unsubscribe; }` | `undefined` |
| `options` _(required)_    | --            |             | `AtomicSearchBoxOptions`                                                                                                                                                                                                                                                                       | `undefined` |
| `placeholder`             | `placeholder` |             | `string`                                                                                                                                                                                                                                                                                       | `'Search'`  |
| `state` _(required)_      | --            |             | `{ value: string; suggestions: { value: string; }[]; isLoading: boolean; }`                                                                                                                                                                                                                    | `undefined` |


## Slots

| Slot | Description                                       |
| ---- | ------------------------------------------------- |
|      | Content is placed inside the clear button element |


## Dependencies

### Used by

 - [atomic-search-box](../atomic-search-box)

### Graph
```mermaid
graph TD;
  atomic-search-box --> atomic-search-box-input
  style atomic-search-box-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
