# Headless Commerce Sample

A vanilla JavaScript sample demonstrating Coveo Headless Commerce controllers with direct DOM manipulation and Vite as the bundler.

**Template name:** `headless-commerce-vite`

## Features

- **Search page** — search box, product results, facets, sort, and pagination
- **Product listing page** — category-based product listing with facets and pagination
- **Recommendations** — product recommendations on the home page
- **Hash-based routing** — simple client-side navigation (`#/`, `#/search`, `#/listing`)

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 9+

## Getting Started

From the repository root:

```sh
pnpm install
pnpm turbo run @samples/headless-commerce#dev
```

Or from this directory:

```sh
pnpm dev
```

The app opens at `http://localhost:5173` and connects to the Coveo sample organization (`searchuisamples`).

## Configuration

The sample uses the `searchuisamples` organization with a pre-configured Commerce catalog. See `src/engine.js` for the full engine configuration.
