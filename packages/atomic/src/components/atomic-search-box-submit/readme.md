# atomic-search-box-submit



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute | Description | Type                                                                                                                                                                                                                                                                                           | Default     |
| ------------------------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `controller` _(required)_ | --        |             | `{ updateText(value: string): void; clear(): void; hideSuggestions(): void; showSuggestions(): void; selectSuggestion(value: string): void; submit(): void; state: { value: string; suggestions: { value: string; }[]; isLoading: boolean; }; subscribe(listener: () => void): Unsubscribe; }` | `undefined` |


## Dependencies

### Used by

 - [atomic-search-box](../atomic-search-box)

### Graph
```mermaid
graph TD;
  atomic-search-box --> atomic-search-box-submit
  style atomic-search-box-submit fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
