---
title: Search Controller hooks
group: Usage
---

# Hooks

This package provides React hooks for controllers defined in the Engine Definition. Hooks allow you to access controller state and methods easily within your React components.
Without these hooks, you would need to manually pass down props through every component or implement your own provider solution, which can be cumbersome and error-prone.

See [Headless SSR usage: Define the search engine and controllers](https://docs.coveo.com/en/headless/latest/reference/documents/usage/server-side-rendering/implement-server-side-rendering.html#create-an-engine-definition)

## Usage

### 1. Create an engine configuration

Define the controllers you need in your engine configuration. This example includes `SearchBox`, `ResultList` and `Facet` controllers:

```
import {
  defineSearchEngine,
  defineSearchBox,
  defineResultList,
  defineFacet,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless-react/ssr';

const engineConfig = {
  configuration: {
    ...getSampleSearchEngineConfiguration(),
  },
  controllers: {
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    authorFacet: defineFacet({ options: { field: 'author' } }),
  },
};
```

### 2. Define the engine

Use `defineSearchEngine` to define the engine with your configuration:

```
export const engineDefinition = defineSearchEngine(engineConfig);
```

### 3. Export hooks

Extract hooks for each controller from the engine definition.

```
export const {
  useSearchBox,
  useResultList,
  useAuthorFacet,
} = engineDefinition.controllers;
```

### 4. Use Hooks in Components

Access controller methods and state in your components through the hooks.
The controller methods and state attributes exposed through controller hooks are the same as the ones exposed by the controllers.
For details, see the relevant controller [reference documentation](../../modules/SSR_Search.html).

```
export default function SearchPage() {
  const {state: searchBoxState, methods: searchBoxMethods} = useSearchBox();
  const {state: resultListState} = useResultList();

  return (
    <div>
      <input
        value={searchBoxState.value}
        onChange={(e) => searchBoxMethods?.updateText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && searchBoxMethods?.submit()}
      />
      <ul aria-label="Result List">
        {resultListState.results.map((result) => (
          <li key={result.uniqueId}>
            {result.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```
