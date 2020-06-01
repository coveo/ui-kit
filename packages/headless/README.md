# Coveo Headless

Contributing:
- [Getting started](#getting-started)
- [Redux](#redux)
- [Source folder structure](#source-folder-structure)

Using the headless library:
- [Configuring a headless engine](#configuring-a-headless-engine)
- [Using headless components](#using-headless-components)
  - [Instantiating a component](#instantiating-a-component)
  - [Interacting with a component](#interacting-with-a-component)
- [Updating the headless state](#updating-the-headless-state)
  - [Understanding actions](#understanding-actions)
  - [Understanding action creators](#understanding-action-creators)
  - [Dispatching actions](#dispatching-actions)
  - [Subscribing to state changes](#subscribing-to-state-changes)

## Contributing

### Getting started

Once you have cloned the repo, follow the instructions in the top-level [README.md](https://bitbucket.org/coveord/ui-kit/src/master/README.md) to install dependencies and link packages.

To start the project in development mode, run:

```bash
npm start
```

To build the library for production, run:

```bash
npm run build
```

To run the unit tests for the components, run:

```bash
npm test
```

To run the unit tests for the components and watch, run:

```bash
npm run test:watch
```

### Redux

The headless project intensively uses ["Redux"](https://redux.js.org) along with ["Redux Toolkit"](https://redux-toolkit.js.org), so prior knowledge is necessary.

### Source folder structure
The base of the `/src` folder should only contain exports.

`/app` contains app-wide setup: Redux store, root reducer, middlewares.

`/features` has folders that each owns the functionalities of a feature, which is a subpart of the redux state. Following the ["ducks pattern"](https://redux.js.org/style-guide/style-guide#structure-files-as-feature-folders-or-ducks), those files contain Redux slices & reducers that [define the state shape](https://redux.js.org/style-guide/style-guide#reducers-should-own-the-state-shape). Each feature folder has a file with actions that can be exported with the project.

`/components` contains all the headless components in folders. Those components are exported and used to provide abstraction from the store's features by being closer to the actual UI components of a customer's application.

`/utils` contains common useful utilities.

`/api` contains everything regarding api calls.

## Using the headless library

### Configuring a headless engine

You can setup a new headless engine by instantiating the `Engine` class with the required configuration, notably your Coveo organization and your access token.
Then, export the instance so it's shared throughout your application.

Instantiation of a new headless `Engine` instance:
```typescript
import {Engine} from '@coveo/headless';

export const engine = new Engine({
  configuration: {
    organizationId: 'your_organization',
    accessToken: 'your_access_token'
  },
});
```

To only test out the library's capabilities, you can use our sample configuration. It will give you access to an organization with dummy data.
```typescript
new ReduxEngine({ configuration: ReduxEngine.getSampleConfiguration() });
```

On the `Engine` class instance, you have a few properties:
- **state:** an object representing complete headless state tree.
- **dispatch:** a method that dispatches an action directly. It is how modifications to the headless state are made.
- **subscribe:** a method that lets you add a change listener. It will be called any time an action is dispatched. You may then access the new state.

### Using headless components
Along with the `Engine` class, the headless library offers different components. These components wrap the headless engine's state and actions to offer an interface that is simpler and closer to the actual end-user experience.

Using components is the recommended way to interact with the headless engine for most use cases. We will use the `SearchBox` component as example here.

#### Instantiating a component
You can setup a new headless component by instantiating its class. Every component constructor has the following parameters:
1. The `Engine` instance, created previously.
2. The specific options for that component, sometimes optional.

Instantiation of a `SearchBox` headless component:
```typescript
import {SearchBox} from '@coveo/headless';
import {engine} from './engine';

const searchBox = new SearchBox(engine, {numberOfQuerySuggestions: 10});
```

#### Interacting with a component
The component will interact with the headless state of the `Engine` instance passed as an argument.

All components have a **state** attribute, which is a scoped part of the headless state that is relevant to the component.

For the `SearchBox` component, the state returns relevant parts of the headless state to be used or rendered in the UI.
```typescript
console.log(searchBox.state); // {value: "", suggestions: [], redirectTo: null}
```

Components also have a **subscribe** method that lets you add a change listener. The difference with the `Engine` class **subscribe** method and a component’s **subscribe** method is that the latter will *only* be called if the component's state has changed. This is to prevent costly operations (e.g., rendering) when an unrelated part of the engine's state is updated.

Components will manage the dispatching of necessary actions to the headless engine.

Every component offers a high-level interface to be used by UI component. E.g, the `SearchBox` component offers methods like `updateText`, `submit`, `clear`, `selectSuggestion`, etc.

Subscribing to a `SearchBox` component's state and interacting with its methods.
```typescript
function onSearchBoxUpdate() {
  const state = searchBox.state;
  // do something with the updated searchBox state
}

const unsubscribe = searchBox.subscribe(onSearchBoxUpdate);

// This will dispatch an action to the engine and update the state
searchBox.updateText({value: 'hello world'});

// When you don't need to listen to state changes anymore (e.g., when a component is deleted)
unsubscribe();
```

### Updating the headless state

The headless state itself is organized by features (e.g., configuration, query suggestion, redirection). Each of those features reacts to different actions in order to update their respective piece of state. When headless components prove insufficient, you can use these actions directly to get a granular control over the application's state.

Let's first explain some basic concepts such as actions and action creators.

#### Understanding actions

An action is a plain object with a few properties:
- **type:** a string value identifying the nature of the action. E.g., `configuration/updateSearchConfiguration` is an action from the `configuration` feature that updates the search configuration.
- **payload:** optional, the payload could be of any type, and varies depending on the type of action. E.g., for an action with the type `configuration/updateSearchConfiguration`, the payload is an object containing the `searchApiBaseUrl` property which is a string.
- **error:** optional, the error is set to `true` when the action represents an error (e.g., a failed promise). When the **error** value is `true` the payload should contain the error object.
- **meta:** optional, the meta property can be of any type and is meant to add extra information not part of the payload (e.g., a request ID).

Actions can either be synchronous or asynchronous, meaning its effects can be seen instantly in the state or at a later time (e.g., when an API request finishes executing).

#### Understanding action creators
```typescript
type ActionCreator = (...args: any) => Action
```

Actions can get complex, that's why the headless library offers action creators for every action to simplify usage. An action creator is a function that takes only relevant arguments and returns the correct action. 

Example:
```typescript
import {configurationActions} from '@coveo/headless';

// Calling the following action creator:
configurationActions.updateSearchConfiguration({
  endpoint: 'https://platform.cloud.coveo.com/'
});

// ...returns the following action:
// {
//   type: 'configuration/updateSearchConfiguration',
//   payload: {
//     endpoint: 'https://platform.cloud.coveo.com/'
//   }
// }
```

#### Dispatching actions

To update the headless state, actions have to be dispatched using the **dispatch** method of the `Engine` class instance.

```typescript
import {configurationActions} from '@coveo/headless';
import {engine} from './engine';

const action = configurationActions.updateSearchConfiguration({ endpoint: 'https://platform.cloud.coveo.com/' });

// Calling dispatch with the action will make the headless engine update its state using the payload (endpoint value)
engine.dispatch(action);
```

#### Subscribing to state changes

Using the **subscribe** method on the `Engine` class instance, the changes can be listened to. The listener function passed to **subscribe** will be called every time an action is dispatched.

```typescript
import {engine} from './engine';

function onStateUpdate() {
  const state = engine.state;
  // do something with the updated state
}

const unsubscribe = engine.subscribe(onStateUpdate);

// When you don't need to listen to state changes anymore (e.g., when a component is deleted).
unsubscribe();
```

**Note:** the listener function is called on **every** action dispatch, so make sure you only perform costly operations, like rendering a UI component, if the state they depend on has changed.
