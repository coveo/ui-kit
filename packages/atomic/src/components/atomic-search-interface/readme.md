# atomic-search-interface



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute              | Description                                                            | Type                                                                                    | Default                    |
| ------------------- | ---------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------- |
| `engine`            | --                     | The search interface Headless engine.                                  | `Engine<SearchAppState> \| undefined`                                                   | `undefined`                |
| `i18n`              | --                     | The search interface i18next instance.                                 | `i18n`                                                                                  | `i18next.createInstance()` |
| `language`          | `language`             | The search interface language.                                         | `string`                                                                                | `'en'`                     |
| `logLevel`          | `log-level`            | The level of messages you want to be logged in the console.            | `"debug" \| "error" \| "fatal" \| "info" \| "silent" \| "trace" \| "warn" \| undefined` | `undefined`                |
| `pipeline`          | `pipeline`             | The search interface [query pipeline](https://docs.coveo.com/en/180/). | `string`                                                                                | `'default'`                |
| `reflectStateInUrl` | `reflect-state-in-url` |                                                                        | `boolean`                                                                               | `true`                     |
| `searchHub`         | `search-hub`           | The search interface [search hub](https://docs.coveo.com/en/1342/).    | `string`                                                                                | `'default'`                |


## Methods

### `executeFirstSearch() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `initialize(options: InitializationOptions) => Promise<void>`



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
