# Headless Search Sample

A vanilla JavaScript sample demonstrating Coveo Headless search controllers with direct DOM manipulation, bundled with Vite.

**Template name:** `headless-search-vite`

## Features

- Search box with query suggestions
- Result list with basic result templates
- Facets (Author, File Type)
- Sort dropdown (Relevance, Most Recent)
- Pagination
- Query summary

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 9+

## Getting Started

From the repository root:

```sh
pnpm install
pnpm turbo run @samples/headless-search#dev
```

Or from this directory:

```sh
pnpm dev
```

The app opens at `http://localhost:5173` and connects to the Coveo sample organization (`searchuisamples`).

## Build

```sh
pnpm build
pnpm preview
```
