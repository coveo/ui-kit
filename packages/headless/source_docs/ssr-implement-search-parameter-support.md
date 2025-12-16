---
title: Implement search parameter support
group: Usage
category: Server-side rendering
slug: usage/server-side-rendering/implement-search-parameter-support
---
# Implement search parameter support

We recommend that you use the [Coveo Headless](https://docs.coveo.com/en/lcdf0493/) SSR utilities with the latest [Next.js](https://nextjs.org/) [App Router](https://nextjs.org/docs/app).
We don’t fully support the [Pages Router](https://nextjs.org/docs/pages).
This article uses the App Router paradigm.

If you decide to use the Pages Router paradigm, there are potential issues which might lead to server reruns during client-side navigation.
This would cause both the client and server to execute search requests to the [Coveo Platform](https://docs.coveo.com/en/186/).
For more details on the root cause of this behavior, refer to [this GitHub issue](https://github.com/vercel/next.js/discussions/19611).

<dl><dt><strong>💡 TIP</strong></dt><dd>

Although you could read this article without being familiar with Next.js, we recommend that you follow the Next.js [Getting Started](https://nextjs.org/docs) documentation first.
</dd></dl>

## Define the engine and controllers

You need to define the engine and controllers required for the search page.
This involves setting up the `SearchParameterManager` component, which is responsible for managing the state of the [search interface](https://docs.coveo.com/en/2741/) and synchronizing it with the URL.

In `src/engine.ts`:

```ts
import {
  defineSearchEngine,
  defineSearchParameterManager,
} from '@coveo/headless-react/ssr';

const accessToken = "<ACCESS_TOKEN>";
const organizationId = "<ORGANIZATION_ID>";
const engineDefinition = defineSearchEngine({
  configuration: {
    accessToken,
    organizationId,
  },
  // ... Any other Headless controller that you want to add to the page (such as Facet or Result list)
  controllers: {
    // ... Other controllers
    searchParameterManager: defineSearchParameterManager() ①
    },
});

export const { useSearchParameterManager } = engineDefinition.controllers; ②
```

1. `searchParameterManager` must be added as the last controller, because it requires other controllers to be initialized first.
Controllers are built in the order in which they’re specified in the engine definition.
2. Make sure to export the `useSearchParameterManager` hook, which will synchronize the search parameters with the URL.

## Define the component

The `SearchParameterManager` component uses the `useSearchParameterManager` hook (exposed in `src/engine.ts`) and the `useAppHistoryRouter` [custom React hook](https://react.dev/learn/reusing-logic-with-custom-hooks) to manage browser history and URL updates.

Create a new file (`src/components/search-parameter-manager.tsx`) and define the `SearchParameterManager` component as follows:

```ts
'use client';

import { useAppHistoryRouter } from './history-router';
import { useSearchParameterManager } from '../engine';

export default function SearchParameterManager() {
  const historyRouter = useAppHistoryRouter();
  const {state, methods} = useSearchParameterManager();

  // ... Rendering logic

  return <></>;
}
```

### Implement a history router hook

The following example shows how you can implement a custom hook to manage browser history.
Add the code in `src/components/history-router.tsx`:

```ts
'use client';

import { useEffect, useMemo, useCallback } from 'react';

function getUrl() {
  if (typeof window === 'undefined') {
    return null;
  }
  return new URL(document.location.href);
}

export function useAppHistoryRouter() {
  const [url, updateUrl] = useReducer(() => getUrl(), getUrl());
  useEffect(() => {
    window.addEventListener('popstate', updateUrl);
    return () => window.removeEventListener('popstate', updateUrl);
  }, []);
  const replace = useCallback(
    (href: string) => window.history.replaceState(null, document.title, href),
    []
  );
  const push = useCallback(
    (href: string) => window.history.pushState(null, document.title, href),
    []
  );
  return useMemo(() => ({url, replace, push}), [url, replace, push]);
}
```

### Update the UI when the URL changes

The `SearchParameterManager` component uses the [`useEffect`](https://react.dev/reference/react/useEffect) hook to synchronize the [search interface](https://docs.coveo.com/en/2741/) with the current URL whenever its search parameter changes.

<dl><dt><strong>💡 TIP</strong></dt><dd>

For more info about `useEffect`, see [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).
</dd></dl>

Any search filter (such as [facet](https://docs.coveo.com/en/198/) value, [query](https://docs.coveo.com/en/231/), or sort criteria) in the URL will automatically be reflected in the interface when loading the search page with specific parameters in the URL.
Add the following code in `src/components/search-parameter-manager.tsx`:

```ts
import { buildSSRSearchParameterSerializer } from '@coveo/headless/ssr';
import { useEffect, useMemo } from 'react';

// ...

  useEffect(() => (
    methods &&
    historyRouter.url?.searchParams &&
    methods.synchronize(
      buildSSRSearchParameterSerializer().toSearchParameters(historyRouter.url.searchParams) ①
      )
  ), [historyRouter.url?.searchParams, methods]);
```

1. The `buildSSRSearchParameterSerializer.toSearchParameters` utility reads search parameters from the URL and parses them into an object that can be added to the [Coveo Platform](https://docs.coveo.com/en/186/) state.

### Update the URL when the UI changes

The browser’s URL also needs to be updated whenever there’s a state change from the [search interface](https://docs.coveo.com/en/2741/).
Add the following code in `src/components/search-parameter-manager.tsx`:

```ts
const correctedUrl = useMemo(() => { ①
  if (!historyRouter.url) {
    return null;
  }

  const newURL = new URL(historyRouter.url);
  const { serialize } = buildSSRSearchParameterSerializer();

  return serialize(state.parameters, newURL);
}, [state.parameters]);

useEffect(() => { ②
  if (!correctedUrl || document.location.href === correctedUrl) {
    return;
  }

  const isStaticState = methods === undefined;
  historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
}, [correctedUrl, methods]);
```

1. The [`useMemo`](https://react.dev/reference/react/useMemo) hook listens for any parameter changes in the state.
Whenever there’s a change, the state’s parameters are serialized (using the `serialize` utility provided by the `@coveo/headless/ssr` package) and applied to the URL.
2. The `useEffect` hook then updates the browser’s history state.

<dl><dt><strong>📌 Note</strong></dt><dd>

You can consult a [working demo](https://github.com/coveo/ui-kit/tree/master/samples/headless-ssr/search-nextjs/app-router) of the component.
</dd></dl>

## Add the component to the search page

```ts
// page.tsx

import { SearchParameterManager } from './components/search-parameter-manager';
import { SearchPageProvider } from '...';
import { fetchStaticState } from './engine';
import { buildSSRSearchParameterSerializer } from '@coveo/headless-react/ssr';

export default async function Search({searchParams}) {
  const {toSearchParameters} = buildSSRSearchParameterSerializer();
  const searchParameters = toSearchParameters(searchParams);

  const staticState = await fetchStaticState({
    controllers: {
      searchParameterManager: {
        initialState: {parameters: searchParameters},
      },
    },
  });

  return (
    <SearchPageProvider staticState={staticState}>
      <SearchParameterManager />
    </SearchPageProvider>
  );
}

export const dynamic = 'force-dynamic';
```