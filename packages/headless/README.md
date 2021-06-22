# Coveo Headless

Using the library: [Coveo Headless Library Official Documentation](https://docs.coveo.com/en/headless/latest/).

## Contributing

### Getting started

Once you have cloned the repo, follow the instructions in the top-level [README.md](https://github.com/coveo/ui-kit/src/master/README.md) to install dependencies and link packages.

To start the project in development mode, run:

```bash
npm start
```

To build the library for production, run:

```bash
npm run build
```

To run the unit tests, run:

```bash
npm test
```

To run the unit tests and watch, run:

```bash
npm run test:watch
```

To use @coveo/headless locally, you have to build the package by running:

```bash
npm run build
```

### Redux

The headless project intensively uses ["Redux"](https://redux.js.org) along with ["Redux Toolkit"](https://redux-toolkit.js.org), so prior knowledge is necessary.

### Source folder structure

The base of the `/src` folder should only contain exports.

`/app` contains app-wide setup: Redux store, root reducer, middlewares.

`/state` contains interfaces for the various application states.

`/features` has folders that each owns the functionalities of a feature, which is a subpart of the redux state. Following the ["ducks pattern"](https://redux.js.org/style-guide/style-guide#structure-files-as-feature-folders-or-ducks), those files contain Redux slices & reducers that [define the state shape](https://redux.js.org/style-guide/style-guide#reducers-should-own-the-state-shape). Each feature folder has a file with actions that can be exported with the project.

`/controllers` contains all the headless controllers in folders. Those controllers are exported and used to provide abstraction from the store's features by being closer to the actual UI controllers of a customer's application.

`/utils` contains common useful utilities.

`/api` contains everything regarding api calls.

`/test` contains test mocks.
