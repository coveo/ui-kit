---
title: Manage access tokens
group: Guides
category: Server-side rendering
slug: usage/server-side-rendering/manage-access-tokens
---

# Manage access tokens

When you render a Coveo experience server-side, you decide which access token each request uses.
This article shows how to set a token for your whole application, how to use a different token per user in a multi-tenant application, and how to update the token on the client after hydration.

> [!NOTE]
>
> Use a [search token](https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication) rather than an API key in a server-side rendered application.
> A search token is scoped and short-lived, so it is safe to send to the browser during hydration, whereas an API key must never reach the client.

For the following examples, assume a shared configuration file (`engine.ts`) that defines the commerce engine:

```ts
// engine.ts

import {defineCommerceEngine} from '@coveo/headless/ssr-commerce-next';

export const engineDefinition = defineCommerceEngine({
  configuration: {
    organizationId: '<ORGANIZATION_ID>',
    accessToken: '<DEFAULT_ACCESS_TOKEN>',
    // ...
  },
  controllers: {
    /* ... */
  },
});

export const {fetchStaticState, hydrateStaticState, setAccessToken} = engineDefinition;
```

## Use one token for the whole application

If a single token is valid for every user — for example, a public search token — set it once in the engine definition’s `configuration`.
Every request uses this token, and you don’t need to do anything else.

This is the default: the token you configure in `engine.ts` is the one used unless you override it for a specific request.

For more details about the `accessToken` configuration and about `renewAccessToken` (the callback the engine runs to obtain a new token when the current one expires), see [Configure a Headless Engine](../../index.html#configure-a-headless-engine).

## Use a different token per user

In a multi-tenant application, each request may need its own token — for example, a search token minted for the currently authenticated user.
Pass an `accessToken` when you fetch the static state to use it for that request only:

```tsx
// server.ts

import {fetchStaticState} from './engine.ts';

export default async function ProductListing({request}: {request: Request}) {
  const userToken = await getSearchTokenForUser(request); // your token-minting logic

  const staticState = await fetchStaticState({
    accessToken: userToken,
    navigatorContext: /* ... */,
    context: {currency: 'USD', language: 'en', country: 'US'},
    controllers: {/* ... */},
  });

  return (
    <ListingProvider staticState={staticState}>
      {/* Other components */}
    </ListingProvider>
  );
}
```

`ListingProvider` here is a provider you build once from your engine definition with `buildProviderWithDefinition` (from `@coveo/headless-react/ssr-commerce-next`), as shown in the [SSR commerce providers documentation](https://docs.coveo.com/en/obif0156/#create-providers).

The token you pass applies to that request only; it doesn’t affect the shared definition or any other request.
When you omit `accessToken`, the request uses the token configured in the definition.

> [!IMPORTANT]
>
> Pass the same token to `hydrateStaticState()` on the client that you passed to `fetchStaticState()` on the server, so the hydrated engine continues using the token the page was rendered with.

> [!NOTE]
>
> The per-request `accessToken` is available on the `@coveo/headless/ssr-commerce-next` engine definition, and on its `@coveo/headless-react/ssr-commerce-next` React wrapper.
> It is not available on the older `@coveo/headless/ssr-commerce` engine definition.

## Update the token on the client

After hydration, an engine keeps running in the browser for the rest of the session.
If you need to change its token while it’s running — for example, after refreshing the user’s session — call `setAccessToken()` on the engine definition on the client.
The new token is propagated to the live engine, and the requests it issues afterward use it.

```tsx
// component/rotate-token.tsx

'use client';

import {setAccessToken} from '../path/to/engine.ts';

export function onSessionRefreshed(newToken: string) {
  setAccessToken(newToken);
}
```

You don’t need to clean anything up when you’re done with a hydrated engine: once your application stops referencing it, it is released automatically.

## Don’t use `setAccessToken()` to change the token per request on the server

`setAccessToken()` updates the token on the shared engine definition, which every request uses.
On the server, where many requests are handled concurrently, calling it for one request changes the token for the others in flight at the same time — one user could end up issuing requests with another user’s token.

To use a different token per request on the server, use the per-request `accessToken` shown above instead.
`setAccessToken()` is safe on the client, where a single hydrated engine runs for the session and no concurrent requests share the definition.

## Summary

| What you want to do | How |
|---|---|
| Use one token for all users | Set `accessToken` in the engine definition `configuration` |
| Use a different token per user | Pass `accessToken` to `fetchStaticState()` and `hydrateStaticState()` |
| Update the token on the client | Call `setAccessToken()` on the engine definition |
| Use a different token per request on the server | Use the per-request `accessToken` — don’t call `setAccessToken()` |
