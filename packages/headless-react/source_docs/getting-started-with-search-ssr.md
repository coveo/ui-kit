---
title: Getting Started with Search SSR
group: Getting Started
slug: getting-started/search-ssr
---
# Getting started with Search SSR

This guide walks through setting up a server-side rendered search interface using `@coveo/headless-react/ssr`.

## Prerequisites

Before getting started, make sure that:

* You have a working knowledge of [React](https://react.dev/) and a React-based framework such as [Next.js](https://nextjs.org/).
* You're familiar with Coveo Headless engines and controllers.
  You can refer to the [Headless usage documentation](https://docs.coveo.com/en/headless/latest/reference/documents/usage/index.html) for an introduction.
* You have Node.js version 20 or later installed.

## Install

Use [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install the package along with its peer dependencies:

```
npm install @coveo/headless-react @coveo/headless react react-dom
```

> [!NOTE]
>
> `@coveo/headless-react` requires React 18 or later.
> If you use TypeScript, note that Headless doesn't support the `classic` or `node10`/`node` `moduleResolution` options.

## Core concepts

The SSR utilities revolve around three core concepts:

1. **Engine definition** — A configuration object that specifies the engine settings and the set of controllers your application needs.
   It provides methods to fetch the static state and to generate the hydrated state.

2. **Static state** — The initial state of the application, generated on the server.
   It contains the data needed for the first render (for example, initial search results) without interactivity.

3. **Hydrated state** — The state after client-side hydration.
   It contains live Headless controllers with methods you can call to add interactivity, as well as the Headless engine instance itself.

## Define the search engine

Create and export an engine definition in a shared file.
Include the controllers and the search engine configuration:

```ts
// lib/engine.ts

import {
  defineSearchEngine,
  defineSearchBox,
  defineResultList,
  defineFacet,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless-react/ssr';

export const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: { enabled: false },
  },
  controllers: {
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    authorFacet: defineFacet({ options: { field: 'author' } }),
  },
});

export const {
  useSearchBox,
  useResultList,
  useAuthorFacet,
} = engineDefinition.controllers;
```

For production use, replace the sample configuration with your own Coveo organization ID and access token:

```ts
export const engineDefinition = defineSearchEngine({
  configuration: {
    organizationId: '<ORGANIZATION_ID>',
    accessToken: '<ACCESS_TOKEN>',
  },
  controllers: {
    // ...
  },
});
```

## Build components with hooks

Each controller defined in the engine definition automatically generates a corresponding React hook.
The hook is named after the controller key, capitalized and prefixed with `use` (for example, `searchBox` → `useSearchBox`).

> [!IMPORTANT]
>
> If you're using Next.js with the [App Router](https://nextjs.org/docs/app), any file which uses these hooks must begin with the `'use client'` directive.

```tsx
'use client';

import { useSearchBox, useResultList } from '../lib/engine';

export function SearchBox() {
  const { state, methods } = useSearchBox();

  return (
    <input
      value={state.value}
      onChange={(e) => methods?.updateText(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && methods?.submit()}
    />
  );
}

export function ResultList() {
  const { state } = useResultList();

  return (
    <ul>
      {state.results.map((result) => (
        <li key={result.uniqueId}>{result.title}</li>
      ))}
    </ul>
  );
}
```

> [!NOTE]
>
> The `methods` property is `undefined` when rendering with the `StaticStateProvider` (that is, on the server).
> Always use optional chaining (`methods?.updateText(...)`) or guard against `undefined` before calling methods.

## Wire up SSR

On the server, fetch the static state.
On the client, hydrate it to restore interactivity.

The engine definition provides `StaticStateProvider` and `HydratedStateProvider` context components, as well as a `hydrateStaticState` function to transition between the two.

```tsx
'use client';

import { useEffect, useState, PropsWithChildren } from 'react';
import { engineDefinition } from '../lib/engine';
import {
  InferStaticState,
  InferHydratedState,
} from '@coveo/headless-react/ssr';

const { hydrateStaticState, StaticStateProvider, HydratedStateProvider } =
  engineDefinition;

type StaticState = InferStaticState<typeof engineDefinition>;
type HydratedState = InferHydratedState<typeof engineDefinition>;

export function SearchProvider({
  staticState,
  children,
}: PropsWithChildren<{ staticState: StaticState }>) {
  const [hydratedState, setHydratedState] = useState<HydratedState | null>(
    null
  );

  useEffect(() => {
    hydrateStaticState({
      searchAction: staticState.searchAction,
    }).then(setHydratedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydratedState) {
    return (
      <StaticStateProvider controllers={staticState.controllers}>
        {children}
      </StaticStateProvider>
    );
  }

  return (
    <HydratedStateProvider
      engine={hydratedState.engine}
      controllers={hydratedState.controllers}
    >
      {children}
    </HydratedStateProvider>
  );
}
```

Then, in your server-rendered page, fetch the static state and pass it to the provider:

```tsx
import { engineDefinition } from '../lib/engine';
import { SearchProvider } from '../components/SearchProvider';
import { SearchBox, ResultList } from '../components/SearchComponents';

const { fetchStaticState } = engineDefinition;

export default async function SearchPage() {
  const staticState = await fetchStaticState();

  return (
    <SearchProvider staticState={staticState}>
      <SearchBox />
      <ResultList />
    </SearchProvider>
  );
}
```

## Samples

* [Search SSR with Next.js](https://github.com/coveo/ui-kit/tree/main/samples/headless-ssr/search-nextjs) — Demonstrates `@coveo/headless-react/ssr` with the Next.js App Router.

## What's next?

* [Search controller hooks](../Search_Controller_hooks.html) — Detailed reference for all available search controller hooks.
* [Extend engine definitions](https://docs.coveo.com/en/headless/latest/reference/documents/usage/server-side-rendering/extend-engine-definitions.html) — Dispatch actions or interact with the engine on the server side.
* [Implement search parameter support](https://docs.coveo.com/en/headless/latest/reference/documents/usage/server-side-rendering/implement-search-parameter-support.html) — Synchronize search parameters with the URL.
