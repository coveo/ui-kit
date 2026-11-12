# Headless search SSR sample, v4 API (Next.js App Router)

The v4 twin of [`search-nextjs`](../search-nextjs): the same search page, built on the search server-side rendering (SSR) API that Headless v4 ships. Until v4, this API is a preview and may change.

| Route      | What it shows                                                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`        | A standalone search box on `standaloneEngineDefinition`: no search runs on the server, and a submitted query opens `/react`.                                               |
| `/generic` | The framework-agnostic way: the server calls `fetchStaticState()`, and the browser calls `hydrateStaticState(staticState)` by hand, as an Angular or Vue application does. |
| `/react`   | The React wrapper: `defineSearchEngine()`, `buildProviderWithDefinition()`, the controller hooks and `useHydration()`.                                                     |

Both search pages keep the URL in sync with the built-in `parameterManager` controller, and `proxy.ts` keeps the visitor's client ID in the `coveo_visitorId` cookie.

## Getting started

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm run dev    # Development server
pnpm run build  # Production build
pnpm run prod   # Production server, after a build
pnpm run e2e    # Playwright tests against the production server and the Coveo sample organization
```
