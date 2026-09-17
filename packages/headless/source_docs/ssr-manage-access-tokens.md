---
title: Manage access tokens
group: Guides
category: Server-side rendering
slug: usage/server-side-rendering/manage-access-tokens
---

# Manage access tokens

When you render a Coveo experience server-side, you decide which access token each request uses.
This article shows how to set a token for your whole application, how to use a different token per user in a multi-tenant application, how to set the navigator context per request, and how to update the token on the client after hydration.

> [!NOTE]
>
> Use a [search token](https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication) rather than an API key in a server-side rendered application.
> A search token is scoped and short-lived, so it is safe to send to the browser during hydration, whereas an API key must never reach the client.

> [!NOTE]
>
> The per-request `accessToken` and `navigatorContext` options shown in this article are available on the `@coveo/headless/ssr-commerce` sub-package (and its `@coveo/headless-react/ssr-commerce` React wrapper).
> They are applied to a single request without mutating the shared engine definition, which is what makes them safe to use under server concurrency.

For the following examples, assume a shared configuration file (`engine.ts`) that defines the commerce engine:

```ts
// engine.ts

import {defineCommerceEngine} from '@coveo/headless-react/ssr-commerce';

export const engineDefinition = defineCommerceEngine({
  configuration: {
    organizationId: '<ORGANIZATION_ID>',
    accessToken: '<DEFAULT_ACCESS_TOKEN>',
    // ...
  },
  controllers: {/* ... */},
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
    navigatorContext: getNavigatorContext(request), // per-request context — see below
    context: {currency: 'USD', language: 'en', country: 'US'},
    controllers: {/* ... */},
  });

  return <ListingProvider staticState={staticState}>{/* Other components */}</ListingProvider>;
}
```

`ListingProvider` here is a provider you build once from your engine definition with `buildProviderWithDefinition` (from `@coveo/headless-react/ssr-commerce`), as shown in the [SSR commerce providers documentation](https://docs.coveo.com/en/obif0156/#create-providers).

The token you pass applies to that request only; it doesn’t affect the shared definition or any other request.
When you omit `accessToken`, the request uses the token configured in the definition.

> [!IMPORTANT]
>
> Pass the same token to `hydrateStaticState()` on the client that you passed to `fetchStaticState()` on the server, so the hydrated engine continues using the token the page was rendered with.

> [!NOTE]
>
> The per-request `accessToken` is available on the `@coveo/headless/ssr-commerce` engine definition, and on its `@coveo/headless-react/ssr-commerce` React wrapper.

## Set the navigator context per request

The navigator context carries per-request signals used for analytics and personalization — the client ID, user agent, referrer, and forwarded-for address. Like the access token, it varies from one request to the next, so it must not be written onto the shared engine definition on the server.

The traditional way to set it, `setNavigatorContextProvider()`, writes into the shared definition. On the server, where requests are handled concurrently, that is racy: one request can read another request's navigator context. Instead, pass a `navigatorContext` when you fetch the static state to use it for that request only:

```tsx
// server.ts

import {fetchStaticState} from './engine.ts';

export default async function ProductListing({request}: {request: Request}) {
  const staticState = await fetchStaticState({
    navigatorContext: getNavigatorContext(request), // your per-request context
    context: {currency: 'USD', language: 'en', country: 'US'},
    controllers: {/* ... */},
  });

  // ...
}
```

`getNavigatorContext(request)` is your own function that reads the request headers and returns a `NavigatorContext` (client ID, user agent, referrer, `x-forwarded-for`). The context you pass applies to that request only; it doesn't affect the shared definition or any other request. When you omit `navigatorContext`, the request uses the provider set with `setNavigatorContextProvider()`, if any.

> [!NOTE]
>
> On the client, after hydration, `setNavigatorContextProvider()` is still the right tool: a single engine runs for the session, so there are no concurrent requests sharing the definition.

## Rotate the token on the client

After hydration, an engine keeps running in the browser for the rest of the session, so its token eventually expires.
Configure `renewAccessToken` on the engine configuration and the engine renews the token on its own: it checks the current token before each request and renews it when it is expired or about to expire, and it also retries once with a fresh token if a request is rejected as unauthorized.

```ts
// engine.ts

export const engineDefinition = defineCommerceEngine({
  configuration: {
    organizationId: '<ORGANIZATION_ID>',
    accessToken: '<DEFAULT_ACCESS_TOKEN>',
    renewAccessToken: async () => {
      const response = await fetch('/api/coveo-token');
      const {token} = await response.json();
      return token;
    },
    // ...
  },
  controllers: {/* ... */},
});
```

Because `renewAccessToken` is part of the engine configuration, it applies to every engine the definition builds, on the server and on the client, and it does not mutate anything shared between requests.

> [!WARNING]
>
> `setAccessToken()` on the engine definition is deprecated and will be removed in a future major version.
> It writes to the shared engine definition, which is unsafe on a server handling concurrent requests.
> Use the per-request `accessToken` to choose the token for a request, and `renewAccessToken` to rotate an expiring one.
> On the `@coveo/headless/ssr-commerce-next` sub-package, `setAccessToken()` and `getAccessToken()` have already been removed.

## Don’t use `setAccessToken()` to change the token per request on the server

`setAccessToken()` updates the token on the shared engine definition, which every request uses.
On the server, where many requests are handled concurrently, calling it for one request changes the token for the others in flight at the same time — one user could end up issuing requests with another user’s token.

To use a different token per request on the server, use the per-request `accessToken` shown above instead.

## Summary

| What you want to do                                 | How                                                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Use one token for all users                         | Set `accessToken` in the engine definition `configuration`                                   |
| Use a different token per user                      | Pass `accessToken` to `fetchStaticState()` and `hydrateStaticState()`                        |
| Rotate an expiring token                            | Configure `renewAccessToken` on the engine `configuration`                                   |
| Use a different token per request on the server     | Use the per-request `accessToken` — don’t call `setAccessToken()`                            |
| Set the navigator context per request on the server | Pass `navigatorContext` to `fetchStaticState()` — don’t call `setNavigatorContextProvider()` |
| Set the navigator context on the client             | Call `setNavigatorContextProvider()` on the engine definition                                |
