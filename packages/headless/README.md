# Coveo Headless

Contributing:

- [Getting started](#getting-started)
- [Redux](#redux)
- [Source folder structure](#source-folder-structure)

Using the headless library:

- [Configuring a headless engine](#configuring-a-headless-engine)
- [Using headless controllers](#using-headless-controllers)
  - [Instantiating a controller](#instantiating-a-controller)
  - [Interacting with a controller](#interacting-with-a-controller)
- [Updating the headless state](#updating-the-headless-state)
  - [Understanding actions](#understanding-actions)
  - [Understanding action creators](#understanding-action-creators)
  - [Dispatching actions](#dispatching-actions)
  - [Subscribing to state changes](#subscribing-to-state-changes)
- [Extending the headless state](#extending-the-headless-state)
  - [Adding reducers](#adding-reducers)
  - [Creating headless controllers](#creating-headless-controllers)

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

To run the unit tests for the controllers, run:

```bash
npm test
```

To run the unit tests for the controllers and watch, run:

```bash
npm run test:watch
```

### Redux

The headless project intensively uses ["Redux"](https://redux.js.org) along with ["Redux Toolkit"](https://redux-toolkit.js.org), so prior knowledge is necessary.

### Source folder structure

The base of the `/src` folder should only contain exports.

`/app` contains app-wide setup: Redux store, root reducer, middlewares.

`/features` has folders that each owns the functionalities of a feature, which is a subpart of the redux state. Following the ["ducks pattern"](https://redux.js.org/style-guide/style-guide#structure-files-as-feature-folders-or-ducks), those files contain Redux slices & reducers that [define the state shape](https://redux.js.org/style-guide/style-guide#reducers-should-own-the-state-shape). Each feature folder has a file with actions that can be exported with the project.

`/controllers` contains all the headless controllers in folders. Those controllers are exported and used to provide abstraction from the store's features by being closer to the actual UI controllers of a customer's application.

`/utils` contains common useful utilities.

`/api` contains everything regarding api calls.

`/test` contains test mocks.

## Using the headless library

### Configuring a headless engine

You can setup a new headless engine by instantiating the `HeadlessEngine` class, which implements the `Engine` interface. The `HeadlessEngine` class requires some basic configuration, notably your Coveo organization and your access token. Reducers are also required for the `HeadlessEngine` to work. They are what build and manage the state of the headless engine. All reducers needed for a search page are already exported as `searchPageReducers`, to add your own custom reducers in order to extend the state, see the [Extending the headless state](#extending-the-headless-state) section.

Then, make sure to export the instance so it's shared throughout your application.

Instantiation of a new headless `HeadlessEngine` instance:

```typescript
import {HeadlessEngine, searchPageReducers} from '@coveo/headless';

export const engine = new HeadlessEngine({
  configuration: {
    organizationId: 'your_organization',
    accessToken: 'your_access_token',
    search: {
      pipeline: 'your_query_pipeline',
      searchHub: 'your_search_hub',
    },
  },
  reducers: searchPageReducers,
});
```

To only test out the library's capabilities, you can use our sample configuration. It will give you access to an organization with dummy data.

```typescript
new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  ...
```

On the `HeadlessEngine` class instance, you have a few properties:

- **state:** an object representing complete headless state tree.
- **dispatch:** a method that dispatches an action directly. It is how modifications to the headless state are made.
- **subscribe:** a method that lets you add a change listener. It will be called any time an action is dispatched. You may then access the new state.

### Using headless controllers

The headless library offers different controllers. These controllers wrap the headless engine's state and actions to offer an interface that is simpler and closer to the actual end-user experience.

Using controllers is the recommended way to interact with the headless engine for most use cases. We will use the `SearchBox` controller as example here.

#### Instantiating a controller

You can setup a new headless controller by instantiating its class. Every controller constructor has the following parameters:

1. The `HeadlessEngine` instance, created previously.
2. The specific options for that controller, sometimes optional.

Instantiation of a `SearchBox` headless controller:

```typescript
import {SearchBox, buildSearchBox} from '@coveo/headless';
import {engine} from './engine';

const searchBox: SearchBox = buildSearchBox(engine);
```

##### Controller options validation.

Every controller's option is validated at runtime according to their type and value. Details about each option is well documented. If an option is invalid, the instanciation of the controller will throw an error describing the issue. Make sure to manage those potential errors.

#### Interacting with a controller

The controller will interact with the headless state of the `HeadlessEngine` instance passed as an argument.

All controllers have a **state** attribute, which is a scoped part of the headless state that is relevant to the controller.

For the `SearchBox` controller, the state returns relevant parts of the headless state to be used or rendered in the UI.

```typescript
console.log(searchBox.state); // {value: "", suggestions: [], redirectTo: null}
```

Controllers will manage the dispatching of necessary actions to the headless engine.

Every controller offers a high-level interface to be used by UI controller. E.g, the `SearchBox` controller offers methods like `updateText`, `submit`, `clear`, `selectSuggestion`, etc.

Subscribing to a `SearchBox` controller's state and interacting with its methods.

```typescript
function onSearchBoxUpdate() {
  const state = searchBox.state;
  // do something with the updated searchBox state
}

const unsubscribe = searchBox.subscribe(onSearchBoxUpdate);

// This will dispatch an action to the engine and update the state
searchBox.updateText({value: 'hello world'});

// When you don't need to listen to state changes anymore (e.g., when a controller is deleted)
unsubscribe();
```

### Updating the headless state

The headless state itself is organized by features (e.g., configuration, query suggestion, redirection). Each of those features reacts to different actions in order to update their respective piece of state. When headless controllers prove insufficient, you can use these actions directly to get a granular control over the application's state.

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
type ActionCreator = (...args: any) => Action;
```

Actions can get complex, that's why the headless library offers action creators for every action to simplify usage. An action creator is a function that takes only relevant arguments and returns the correct action.

Example:

```typescript
import {ConfigurationActions} from '@coveo/headless';

// Calling the following action creator:
ConfigurationActions.updateSearchConfiguration({
  endpoint: 'https://platform.cloud.coveo.com/',
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

To update the headless state, actions have to be dispatched using the **dispatch** method of the `HeadlessEngine` class instance.

```typescript
import {ConfigurationActions} from '@coveo/headless';
import {engine} from './engine';

const action = ConfigurationActions.updateSearchConfiguration({
  endpoint: 'https://platform.cloud.coveo.com/',
});

// Calling dispatch with the action will make the headless engine update its state using the payload (endpoint value)
engine.dispatch(action);
```

##### Action validation

The actions parameters are validated at runtime according to their type and value. Details about each parameter is well documented. If a parameter is invalid, the action will not be dispatched to the headless engine and an error will be thrown.

#### Subscribing to state changes

Using the **subscribe** method on the `HeadlessEngine` class instance, the changes can be listened to. The listener function passed to **subscribe** will be called every time an action is dispatched.

```typescript
import {engine} from './engine';

function onStateUpdate() {
  const state = engine.state;
  // do something with the updated state
}

const unsubscribe = engine.subscribe(onStateUpdate);

// When you don't need to listen to state changes anymore (e.g., when a controller is deleted).
unsubscribe();
```

**Note:** the listener function is called on **every** action dispatch, so make sure you only perform costly operations, like rendering a UI controller, if the state they depend on has changed.

### Extending the headless state

It can be useful to add custom functionalities to the headless engine. That's why the headless engine is designed at its core to be extendable.

#### Adding reducers

The state shape of the headless engine is dictated by its reducers. A reducer is a function that accepts a piece of state and an action and returns a new permuted state.

```typescript
type Reducer<S, A> = (state: S, action: A) => S;
```

In our example, for the sake of simplicity, let's create a simple counter reducer with actions:

```typescript
export const incrementCounterAction = {type: 'counter/increment'};
export const decrementCounterAction = {type: 'counter/decrement'};

const initialCounterState = 0;

export const counterReducer = (
  state = initialCounterState,
  action: typeof incrementCounterAction | typeof decrementCounterAction
) => {
  switch (action.type) {
    case incrementCounterAction.type:
      return state + 1;
    case decrementCounterAction.type:
      return state - 1;
  }
  return state;
};
```

Here, the counter reducer function takes a state which is a number value, and an action. Depending on the action's type, it will return a new state with the value either incremented or decremented.

The headless library exports some of [Redux Toolkit](https://redux-toolkit.js.org/)'s utilitary functions to ease and streamline development:

- [createReducer](https://redux-toolkit.js.org/api/createReducer): A utility that simplifies the creation of Redux reducers, and manages immutability internally.
- [createAction](https://redux-toolkit.js.org/api/createAction): A helper function for defining a Redux action type and creator.
- [createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk): A helper function for defining a Redux "Thunk", which is more complex action creator that returns a function instead of an action. It is the recommended approach when handling async request lifecycles.

We strongly recommend using those utilitary functions and reading their respective documentation. If you are using TypeScript, we strongly recommend looking up the [Usage With TypeScript
](https://redux-toolkit.js.org/usage/usage-with-typescript) section as well.

We also offer out-of-the-box reducers map that contain a group of features, like the `searchPageReducers` which offer all the necessary functionalities to build a search page. The reducer map is defined during initialization:

```typescript
import {HeadlessEngine, searchPageReducers} from '@coveo/headless';
import {counterReducer} from './counter-reducer';

export const engine = new HeadlessEngine({
  configuration: {
    ...
  },
  reducers: {
    ...searchPageReducers
    counter: counterReducer,
  },
});
```

The state will be automatically built out of the reducers, and will respond accordingly to the dispatched actions:

```typescript
import {engine} from './engine';
import {incrementCounterAction} from './counter-reducer';

engine.dispatch(incrementCounterAction);
console.log(engine.state.counter); // 1
```

#### Creating headless controllers

It is possible to create custom headless controllers using the `buildController` function. When using Typescript, it is necessary to specify the type of the engine.

```typescript
import {
  Engine,
  buildController
} from '@coveo/headless';
import {
  incrementCounterAction,
  decrementCounterAction,
} from './counter-reducer';
import {engine} from './engine';

export type CounterState = Counter['state'];

export type Counter = ReturnType<typeof buildCounter>;

export const buildCounter = (
  engine: Engine
) => {
  const controller = buildController(engine);

  return {
    ...controller,

    increment() {
      dispatch(incrementCounterAction);
    },

    decrement() {
      dispatch(decrementCounterAction);
    },

    get state() {
      return engine.state.counter;
    },
  };
};
```
