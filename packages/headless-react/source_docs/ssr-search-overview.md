# SSR Search

This module provides the React utilities for building server-side rendered search interfaces with `@coveo/headless-react/ssr`.

It includes:

- **Engine definition** — `defineSearchEngine` to configure and instantiate a headless search engine for SSR.
- **Controllers** — Pre-built React hooks for search controllers such as facets, result lists, query suggestions, breadcrumbs, and more.
- **Actions** — Redux action creators to dispatch search-related actions (e.g., executing a search, updating query, managing facet state).
- **Providers** — React context providers that supply the engine and controller state to your component tree.

See [Getting started with Search SSR](../documents/getting-started/search-ssr.html) for a setup guide.
