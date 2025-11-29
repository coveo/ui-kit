---
title: Send context
group: Usage
category: Server-side rendering
slug: usage/server-side-rendering/send-context
---
# Send context

For both of the following examples, assume that there’s a shared configuration file (`engine.ts`) which defines the search engine and context controller:

```ts
// engine.ts

import { defineSearchEngine, defineContext } from '@coveo/headless-react/ssr';

const engineDefinition = defineSearchEngine({
  // ...
  controllers: { context: defineContext() },
});

export const { fetchStaticState } = engineDefinition;
```

## Send context from the server before the page first loads

You need to define the context values on the server before the page first loads so that they can be added to future requests.

The following is an example implementation:

```tsx
// server.ts

import { fetchStaticState } from './engine.ts';

export default async function Search() {
  const contextValues = {
    region: 'Canada',
    role: getRole(),
  };

  const staticState = await fetchStaticState({
    controllers: {
      context: {
        initialState: { values: contextValues },
      },
    },
  });

  return (
    <SearchPageProvider staticState={staticState}>
      {/* Other search page components */}
    </SearchPageProvider>
  );
}
```

Once your application is hydrated, the initial context values will persist on the client side.

## Send context from the client side

You can use the [Coveo Headless](https://docs.coveo.com/en/lcdf0493/) `useContext` method to send context from the client side.
This method lets you access the context controller and set the context values.

First, modify the `engine.ts` file to export the `useContext` hook:

```ts
// engine.ts

// ...
export const { useContext } = engineDefinition.controllers;
```

Then, in your component, you can use the `useContext` and `set` methods to set the context values:

```tsx
// component/context.ts

'use client';

import { useContext } from '../path/to/engine.ts';

export default function Context() {
  const { methods } = useContext();

  methods?.set({
    region: 'Canada',
    role: getRole()
  })

  return <></>
}
```

<dl><dt><strong>❗ IMPORTANT</strong>

Don’t forget to add this component inside your `SearchPageProvider`.

</dt><dd>