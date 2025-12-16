---
title: Extend engine definitions
group: Usage
category: Server-side rendering
slug: usage/server-side-rendering/extend-engine-definitions
---
# Extend engine definitions

```ts
const staticState = await engineDefinition.fetchStaticState();
```

and you would hydrate it as follows:

```ts
const hydratedState = await engineDefinition.hydrateStaticState({
  searchAction: staticState.searchAction,
});
```

However, you may sometimes need to access the engine and controllers before the initial search is executed during `fetchStaticState`, or before the initial search gets simulated during `hydrateStaticState`.

Coveo provides three utilities for these situations:

* `build`
* `fetchStaticState.fromBuildResult`
* `hydrateStaticState.fromBuildResult`

## Build the engine and controllers

You can build an engine and its controllers directly from an engine definition by calling your engine definition’s `build` as follows:

```ts
const { engine, controllers } = await engineDefinition.build();
```

If you need to initialize the engine with a slightly different configuration than the one inherited from your engine definition, you may `extend` it as follows:

```ts
const { engine, controllers } = await engineDefinition.build({
  extend(options) {
    return {
      ...options,
      logFormatter() {
        // ...
      },
    };
  },
});
```

## Fetch the static state

Internally, the `fetchStaticState` method does five things:

1. It initializes an engine.
2. It initializes controllers.
3. It executes a search and waits for it to finish.
4. It returns `searchAction`.
This is an action which, when dispatched, is equivalent to re-executing the search and getting the same response.
5. It returns a copy of the state of every controller.

If you want to access the engine and controllers, you can use `build`, which effectively replaces steps 1 and 2.
You can then use `fetchStaticState.fromBuildResult`, which effectively replaces steps 3 to 5.

```ts
const { engine, controllers } = await engineDefinition.build();
const staticState = await engineDefinition.fetchStaticState.fromBuildResult({
  buildResult: { engine, controllers },
});
```

## Hydrate the static state

Internally, the `hydrateStaticState` method does four things:

1. It initializes an engine.
2. It initializes controllers.
3. It dispatches the `searchAction` given to it.
4. It returns the engine and controllers it initialized.

If you want to access the engine and controllers, you can use `build`, which effectively replaces steps 1 and 2.
You can then use `hydrateStaticState.fromBuildResult`, which effectively replaces steps 3 and 4.

```ts
const { engine, controllers } = await engineDefinition.build();
const staticState = await engineDefinition.hydrateStaticState.fromBuildResult({
  buildResult: { engine, controllers },
  searchAction,
});
```

## Keep the server and client aligned

If you choose to manipulate the engine or controllers before passing them to `fromBuildResult`, this could effect the state that’s returned by whichever `fromBuildResult` was called.
For this reason, we recommend that you extract any manipulations you do to your engine into a separate function.
You can then use it for both `fetchStaticState.fromBuildResult` and `hydrateStaticState.fromBuildResult`, as in the following code samples.

In `common/engine-definition.ts`:

```ts
import {
  defineSearchEngine,
  defineSearchBox,
  defineResultList,
  defineFacet,
  getSampleSearchEngineConfiguration,
  loadQueryActions,
  SearchCompletedAction,
} from '@coveo/headless-react/ssr';

const engineDefinition = defineSearchEngine({ ①
  configuration: getSampleSearchEngineConfiguration(),
  controllers: {
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    authorFacet: defineFacet({ field: "author" }),
    sourceFacet: defineFacet({ field: "source" }),
  },
});

async function getBuildResult() { ②
  const buildResult = await engineDefinition.build();
  const { updateQuery } = loadQueryActions(buildResult.engine);
  buildResult.engine.dispatch(updateQuery({ q: "I like trains" }));
  return buildResult;
}

export async function fetchStaticState() { ③
  return engineDefinition.fetchStaticState.fromBuildResult({
    buildResult: await getBuildResult(),
  });
}

export async function hydrateStaticState(options: { ④
  searchAction: SearchCompletedAction;
}) {
  return engineDefinition.hydrateStaticState.fromBuildResult({
    buildResult: await getBuildResult(),
    searchAction: options.searchAction,
  });
}
```

1. Don’t export `engineDefinition`.
2. Extract your logic to obtain the build result.
3. Export your own customized version of `fetchStaticState`.
4. Export your own customized version of `hydrateStaticState`.

In `server.ts`:

```ts
import { fetchStaticState } from './common/engine-definition.ts';

// ...

const staticState = await fetchStaticState(); ①
// ...
```

1. Your server code isn’t polluted with with a lot of complex logic.

In `client.ts`:

```ts
import { hydrateStaticState } from './common/engine-definition.ts';

// ...

const hydratedState = await hydrateStaticState({
  searchAction: staticState.searchAction,
});
```

> [!WARNING]
> Avoid doing something like the following code samples.
> 
> In `common/engine-definition.ts`:
> 
> ```ts
> import {
>   defineSearchEngine,
>   defineSearchBox,
>   defineResultList,
>   defineFacet,
>   getSampleSearchEngineConfiguration,
> } from '@coveo/headless-react/ssr';
> 
> export const engineDefinition = defineSearchEngine({
>   configuration: {
>     ...getSampleSearchEngineConfiguration(),
>     analytics: { enabled: false },
>   },
>   controllers: {
>     searchBox: defineSearchBox(),
>     resultList: defineResultList(),
>     authorFacet: defineFacet({ field: "author" }),
>     sourceFacet: defineFacet({ field: "source" }),
>   },
> });
> ```
> 
> In `server.ts`:
> 
> ```ts
> import { engineDefinition } from './common/engine-definition.ts';
> import { loadQueryActions } from '@coveo/headless-react/ssr';
> 
> // ...
> 
> const buildResult = await engineDefinition.build();
> const { updateQuery } = loadQueryActions(buildResult.engine);
> buildResult.engine.dispatch(updateQuery({ q: "I like trains" }));
> 
> const staticState = await engineDefinition.fetchStaticState.fromBuildResult({
>   buildResult,
> });
> // ...
> ```
> 
> In `client.ts`:
> 
> ```ts
> import { engineDefinition } from './common/engine-definition.ts';
> 
> const buildResult = await engineDefinition.build();
> const hydratedState = await engineDefinition.hydrateStaticState.fromBuildResult(
>   {
>     buildResult,
>     searchAction: staticState.searchAction,
>   }
> );
> ```