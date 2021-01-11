# atomic-search-interface



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type                                                                                    | Default                    |
| ----------- | ------------ | ----------- | --------------------------------------------------------------------------------------- | -------------------------- |
| `engine`    | --           |             | `Engine<SearchAppState> \| undefined`                                                   | `undefined`                |
| `i18n`      | --           |             | `i18n`                                                                                  | `i18next.createInstance()` |
| `language`  | `language`   |             | `string`                                                                                | `'en'`                     |
| `logLevel`  | `log-level`  |             | `"debug" \| "error" \| "fatal" \| "info" \| "silent" \| "trace" \| "warn" \| undefined` | `undefined`                |
| `pipeline`  | `pipeline`   |             | `string`                                                                                | `'default'`                |
| `sample`    | `sample`     |             | `boolean`                                                                               | `false`                    |
| `searchHub` | `search-hub` |             | `string`                                                                                | `'default'`                |


## Events

| Event   | Description | Type               |
| ------- | ----------- | ------------------ |
| `ready` |             | `CustomEvent<any>` |


## Methods

### `initialize(options: Pick<HeadlessConfigurationOptions, 'accessToken' | 'organizationId' | 'renewAccessToken' | 'platformUrl'>) => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [atomic-component-error](../atomic-component-error)
- [atomic-relevance-inspector](../atomic-relevance-inspector)

### Graph
```mermaid
graph TD;
  atomic-search-interface --> atomic-component-error
  atomic-search-interface --> atomic-relevance-inspector
  style atomic-search-interface fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
