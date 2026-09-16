---
title: Manage access tokens
group: Guides
category: Server-side rendering
slug: usage/server-side-rendering/manage-access-tokens
---

# Manage access tokens

When you render a Coveo experience server-side, you decide which access token each request uses.
This article shows how to set a token for your whole application, how to use a different token per user in a multi-tenant application, and how to update the token of an engine that is running in the browser.

> [!NOTE]
>
> Use a [search token](https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication) rather than an API key in a server-side rendered application.
> A search token is scoped and short-lived, so it is safe to send to the browser during hydration, whereas an API key must never reach the client.

For the following examples, assume a shared configuration file (`engine.ts`) that defines the commerce engine:

```ts
// engine.ts

import {defineCommerceEngine} from '@coveo/headless/ssr-commerce';

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

export const {fetchStaticState, hydrateStaticState} = engineDefinition;
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
    <CommercePageProvider staticState={staticState}>
      {/* Other components */}
    </CommercePageProvider>
  );
}
```

The token you pass applies to that request only; it doesn’t affect the shared definition or any other request.
When you omit `accessToken`, the request uses the token configured in the definition.

> [!IMPORTANT]
>
> Pass the same token to `hydrateStaticState()` on the client that you passed to `fetchStaticState()` on the server, so the hydrated engine continues using the token the page was rendered with.

> [!NOTE]
>
> The per-request `accessToken` is available on the `@coveo/headless/ssr-commerce` engine definition, and on its `@coveo/headless-react/ssr-commerce` React wrapper.

## Update the token of a running browser engine

After hydration, the engine keeps running in the browser for the rest of the session.
If you need to change its token while it’s running — for example, after refreshing the user’s session — call `setAccessToken()` on the hydrated engine.
Requests the engine issues afterward use the new token.

You don’t need to clean anything up when you’re done with a hydrated engine: once your application stops referencing it, it is released automatically.

## Don’t change the per-request token on the shared definition

To use a different token per request on the server, use the per-request `accessToken` shown above — don’t call `setAccessToken()` on the shared engine definition.
The definition is shared across every request, so changing its token from one request affects the others handling requests at the same time.

Reserve `setAccessToken()` for updating a single engine that is running in the browser.

## Summary

| What you want to do | How |
|---|---|
| Use one token for all users | Set `accessToken` in the engine definition `configuration` |
| Use a different token per user | Pass `accessToken` to `fetchStaticState()` and `hydrateStaticState()` |
| Change the token of a running browser engine | Call `setAccessToken()` on the hydrated engine |
| Use a different token per request on the server | Use the per-request `accessToken` — don’t mutate the shared definition |
