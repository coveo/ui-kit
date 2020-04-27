# Coveo Headless Engine

## Source folder structure
The base of the `/src` folder should only contain exports.

`/app` contains app-wide setup: Redux store, root reducer, middlewares.

`/features` has folders that each owns the functionalities of a feature, which is a subpart of the redux state. Following the ["ducks pattern"](https://redux.js.org/style-guide/style-guide#structure-files-as-feature-folders-or-ducks), those files contain Redux slices & reducers that [define the state shape](https://redux.js.org/style-guide/style-guide#reducers-should-own-the-state-shape), while also containing every actions & action creators.

`/components` contains all the headless components in folders. Those components are exported and used to provide abstraction from the store's features by being closer to the actual UI components of a customer's application.

`/utils` contains common useful utilities.

`/api` contains everything regarding api calls.

