---
title: Contributing
---

# Contributing to @coveo/headless-react

## Entry points

| Sub-package                                    | Entry point                               |
| ---------------------------------------------- | ----------------------------------------- |
| Search SSR                                     | `@coveo/headless-react/ssr`               |
| Commerce SSR (Open Beta)                       | `@coveo/headless-react/ssr-commerce`      |
| Search SSR (experimental, subject to change)   | `@coveo/headless-react/ssr-next`          |
| Commerce SSR (experimental, subject to change) | `@coveo/headless-react/ssr-commerce-next` |

## Getting started

Once you have cloned the repo, follow the instructions in the top-level [README.md](https://github.com/coveo/ui-kit/blob/main/README.md) to install dependencies and link packages.

To build the library for production, run:

```bash
pnpm run build
```

To run the unit tests, run:

```bash
pnpm test
```

To run the unit tests in watch mode, run:

```bash
pnpm run test:watch
```

## Generating documentation

The documentation is built in two stages using [TypeDoc](https://typedoc.org/) with the `@coveo/documentation` plugin.

**Stage 1** generates intermediate JSON for each sub-package:

```bash
pnpm run build:typedoc:docs
```

**Stage 2** merges the JSON and produces the final HTML site:

```bash
pnpm run build:typedoc:merge
```

Or run both stages together:

```bash
pnpm run build:typedoc
```

To preview the generated documentation locally:

```bash
pnpm run serve:typedoc
```

Handwritten documentation articles live in `source_docs/` and are included via the `projectDocuments` option in `typedoc.json`.

## Source folder structure

`/src/ssr` contains the search SSR engine definition, React hooks, and context providers.

`/src/ssr-commerce` contains the commerce SSR engine definition, React hooks, and context providers.

`/src/ssr-next` re-exports from `ssr` for experimental/upcoming breaking changes.

`/src/ssr-commerce-next` re-exports from `ssr-commerce` for experimental/upcoming breaking changes.

`/src/__tests__` contains shared test utilities, mocks, and setup.

`/src/client-utils.ts` contains client-side utility functions.

`/src/errors.ts` defines custom error types.

`/src/utils.ts` contains shared utility functions.
