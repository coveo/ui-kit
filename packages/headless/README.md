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

# Adding a new controller.

Controllers are the building blocks of Headless, that make it easy to build visual components on top of, by exposing relevant methods and state. Headless provides controllers to power search boxes, result lists, facets, pagers and many more UI components.


## Checklist

Building a new controller typically involves the following steps:

1. Create a design document describing the new controller's api. Consider the options the controller should accept, and the methods and state it should expose. Once ready, share the document with teammates for feedback.

2. Implement the controller under the `src/controllers/` directory.

3. Split the implementation process in multiple smaller code review instead of just one big diff. It's okay to have partial/incomplete implementation merged in master, as long as nothing is exported or documented publicly.

4. JSDoc is mandatory for all public symbols that will be interacted with by users of the library: This means new actions, options, interface, controller, functions, etc. Private symbols that are not exported do not require any documentation. Please include someone from the documentation team to help the review process.

5. Unit tests are mandatory, but can be added at a later stage of the development process, when the implementation is nearing the end and the new feature is more complete and solid.

6. When the feature is ready to be released, you will need to export the newly created feature in various index.ts files, depending on what you created. For example, a new controller would need to be exported in `src/controllers/index.ts`. This will make it usable/importable by end users of the library. All newly created actions (if any) also need to be exported through the concept of "action loader". For an example, look at `src/features/pagination/pagination-actions-loader`. This is mandatory, and any action not exported in this manner (and only usable through a controller) should be considered a bug.

7. Create code samples for the controller inside the `samples` package in UI-KIT repository. Those will get picked up automatically by various documentation tool, and will appear as code sample usage on docs.coveo.com/headless. Those should be code reviewed as well.

8. Tell the documentation tools how to extract the controller reference documentation and code samples by adding a new entry to the relevant configuration(s) under `headless/doc-parser/use-cases`. Similar as above, that config will configure documentation tool so that all reference and samples appear on docs.coveo.com/headless

9. Think about possibly writing a new dedicated "handwritten" article about the feature and it's usage, if you think/judge that an end user of the library would need more context to understand the usage of a particular controller or high level feature. For example, if a controller requires special configuration in Coveo admin console, or if it needs special interaction with the end user application. If you think such an article would be helpful for end users of the library, write a google doc and share it with the documentation team. They will be able to help you publish it on docs.coveo.com/headless.

10. You are done ! You can now consider planning adding support for the new feature in one of our UI component library (Atomic, Quantic).
