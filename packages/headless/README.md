---
title: Contributing
---

[![npm version](https://badge.fury.io/js/@coveo%2Fheadless.svg)](https://badge.fury.io/js/@coveo%2Fheadless)

# Coveo Headless

Using the library: [Coveo Headless Library Official Documentation](https://docs.coveo.com/en/headless/latest/).

## Entry points

The `@coveo/headless` package exposes several entry points.

The entry point from which you will import Coveo Headless resources depends on the engine type you are using:

| Engine type                         | Entry point                         |
| ----------------------------------- | ----------------------------------- |
| Search engine                       | `@coveo/headless`                   |
| Search SSR engine                   | `@coveo/headless/ssr`               |
| Search SSR engine (in open alpha)   | `@coveo/headless/ssr-next`          |
| CaseAssist engine                   | `@coveo/headless/case-assist`       |
| Commerce engine                     | `@coveo/headless/commerce`          |
| Commerce SSR engine (in open beta)  | `@coveo/headless/ssr-commerce`      |
| Commerce SSR engine (in open alpha) | `@coveo/headless/ssr-commerce-next` |
| Insight engine                      | `@coveo/headless/insight`           |
| Recommendation engine               | `@coveo/headless/recommendation`    |

## Contributing

### Getting started

Once you have cloned the repo, follow the instructions in the top-level [README.md](https://github.com/coveo/ui-kit/src/main/README.md) to install dependencies and link packages.

To start the project in development mode, run:

```bash
pnpm run dev
```

To build the library for production, run:

```bash
pnpm run build
```

To run the unit tests, run:

```bash
pnpm test
```

To run the unit tests and watch, run:

```bash
pnpm run test:watch
```

To use @coveo/headless locally, you have to build the package by running:

```bash
pnpm run build
```

### Redux

The headless project intensively uses ["Redux"](https://redux.js.org) along with ["Redux Toolkit"](https://redux-toolkit.js.org), so prior knowledge is necessary.

### Source folder structure

The base of the `/src` folder should only contain exports.

`/ssr` contains all logic and types related to server-side rendering (SSR) engines and controllers

`/app` contains app-wide setup: Redux store, root reducer, middlewares.

`/state` contains interfaces for the various application states.

`/features` has folders that each owns the functionalities of a feature, which is a subpart of the redux state. Following the ["ducks pattern"](https://redux.js.org/style-guide/style-guide#structure-files-as-feature-folders-or-ducks), those files contain Redux slices & reducers that [define the state shape](https://redux.js.org/style-guide/style-guide#reducers-should-own-the-state-shape). Each feature folder has a file with actions that can be exported with the project.

`/controllers` contains all the headless controllers in folders. Those controllers are exported and used to provide abstraction from the store's features by being closer to the actual UI controllers of a customer's application.

`/utils` contains common useful utilities.

`/api` contains everything regarding api calls.

`/test` contains test mocks.

# Contribution guide: Adding a new controller.

Please see [the contributor guide](./contributors/adding-a-controller.md) for guidance.

# Contribution guide: Troubleshooting bundle content.

Please see [the contributor guide](./contributors/troubleshooting-bundles-content.md) for guidance.
