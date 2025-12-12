---
title: Introduction
group: Usage
slug: usage/index
---
# Usage

A project built on top of Headless will typically involve two main building-blocks: the _engine,_ which manages the state of the search interface and communicates with the Coveo Platform, and the _controllers,_ which dispatch actions to the engine based on user interactions.

<dl><dt><strong>📌 Note</strong></dt><dd>

To create a starter Angular, React, or Vue.js project with a Coveo Headless-powered search page, check out the [Coveo CLI](https://github.com/coveo/cli#readme).
The CLI can handle several steps for you.
</dd></dl>

This article provides an overview of the core Headless concepts.

## Install Headless

Use [npm](https://www.npmjs.com/get-npm) to install the Headless library.

```
npm install @coveo/headless
```

Headless requires Node.js version 20.

<dl><dt><strong>📌 Note</strong></dt><dd>

If you use TypeScript, note that Headless doesn’t support the `classic` or `node10`/`node` `moduleResolution` options.
See [TypeScript module resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution) and [Announcing TypeScript 5.0 `--moduleResolution bundler`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#--moduleresolution-bundler).
</dd></dl>

## Configure a Headless Engine

To start building an application on top of the [Headless library](https://docs.coveo.com/en/lcdf0493/), you must first initialize a [Headless engine](https://docs.coveo.com/en/headless/latest/reference/index.html) using one of the builder functions, each of which is dedicated to a specific use case.
Each builder function is imported from a dedicated sub-package that has the relevant exports for its use case.
These engine builder functions are:

* `buildSearchEngine` (imported from `@coveo/headless'`)
* `buildCaseAssistEngine` (imported from `@coveo/headless/case-assist'`)
* [`buildCommerceEngine`](https://docs.coveo.com/en/o52e9091/) (imported from `@coveo/headless/commerce'`)
* `buildInsightEngine` (imported from `@coveo/headless/insight'`)
* `buildRecommendationEngine` (imported from `@coveo/headless/recommendation'`)
* `defineSearchEngine` (imported from `@coveo/headless/ssr'`)

You’ll specify your _search endpoint_ configuration through this instance (that is, where to send Coveo search requests and how to [authenticate](https://docs.coveo.com/en/2120/) them).

For testing purposes, you can pass the sample configuration for the engine builder function that you’re calling:

```ts
// app/Engine.ts

import { buildSearchEngine, getSampleSearchEngineConfiguration } from '@coveo/headless';

// If you're using a different engine builder function, this would be something like the following:
// import {buildRecommendationEngine, getSampleRecommendationEngineConfiguration} from '@coveo/headless/recommendation';

export const headlessEngine = buildSearchEngine({
  configuration: getSampleSearchEngineConfiguration()
});

// If you're using a different engine builder function, this would be something like the following:
// export const recommendationEngine = buildRecommendationEngine({
//   configuration: getSampleRecommendationEngineConfiguration()
// });
```

However, most of the time, your initialization and export will look like this:

```ts
// app/Engine.ts

import { buildSearchEngine } from '@coveo/headless';

export const headlessEngine = buildSearchEngine({
  configuration: {
    organizationId: '<ORGANIZATION_ID>', ①
    accessToken: '<ACCESS_TOKEN>', ②
    renewAccessToken: <CALLBACK>, ③
  }
});
```

1. `<ORGANIZATION_ID>` (string) is the [unique identifier of your Coveo organization](https://docs.coveo.com/en/n1ce5273/) (for example, `mycoveoorganization`).
2. `<ACCESS_TOKEN>` (string) is an [API key](https://docs.coveo.com/en/105/) that was created using the **Anonymous search** [template](https://docs.coveo.com/en/1718#api-key-templates) or a [search token](https://docs.coveo.com/en/56/) that grants the **Allowed** [access level](https://docs.coveo.com/en/2818/) on the [**Execute Queries**](https://docs.coveo.com/en/1707#execute-queries-domain) [domain](https://docs.coveo.com/en/2819/) and the **Push** [access level](https://docs.coveo.com/en/2818/) on the [**Analytics Data**](https://docs.coveo.com/en/1707#administrate-domain) [domain](https://docs.coveo.com/en/2819/) in the target [organization](https://docs.coveo.com/en/185/).
3. `<CALLBACK>` (function) returns a new access token, usually by fetching it from a backend service that can generate [search tokens](https://docs.coveo.com/en/56/).
The engine will automatically run this function when the current access token expires (that is, when the engine detects a `419 Authentication Timeout` HTTP code).

   <dl><dt><strong>📌 Note</strong></dt><dd>

   You don’t need to specify a `renewAccessToken` callback if your application is using [API key authentication](https://docs.coveo.com/en/105/).
   This is typically not recommended, but can be legitimate in some scenarios.
   </dd></dl>

## Use Headless Controllers

A Headless _controller_ is an abstraction that simplifies the implementation of a specific Coveo-powered UI feature or component.
In other words, controllers provide intuitive programming interfaces for interacting with the Headless engine’s state.

For most use cases, we recommend that you use controllers to interact with the state.

**Example**

To implement a search box UI component, you decide to use the [`SearchBox`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchBox.html) controller, available in the Headless [Search Engine](https://docs.coveo.com/en/headless/latest/reference/modules/Search.html).

This controller exposes various public methods such as `updateText` and `submit`.
You write code to ensure that when the end user types in the search box, the `Searchbox` controller’s `updateText` method is called.
Under the hood, calling this method dispatches some actions.
The Headless Search Engine’s reducers react to those actions by updating the state as needed.

In this case, the `query` property of the state is updated.
Then, the controller fetches new query suggestions from the Search API, and updates the `querySuggestState` property.

For detailed information on the various Headless controllers, see the [reference documentation](https://docs.coveo.com/en/headless/latest/reference/index.html).

### Initialize a Controller Instance

You can initialize a Headless Controller instance by calling its builder function.

A controller’s builder function always requires a Headless engine instance as a first argument.

```typescript
// src/Components/MySearchBox.ts
 
import { SearchBox, buildSearchBox } from '@coveo/headless';
import { engine } from '../Engine';
 
const mySearchBox: SearchBox = buildSearchBox(engine);
```

Many builder functions also accept, and sometimes require, an options object as a second argument.

```typescript
// src/Components/MyStandaloneSearchBox.ts
 
import { SearchBox, SearchBoxOptions, buildSearchBox } from '@coveo/headless';
import { engine } from '../Engine';
 
const options: SearchBoxOptions = { ①
  numberOfSuggestions: 3,
  isStandalone: true
}
 
const myStandaloneSearchBox: SearchBox = buildSearchBox(engine, { options });
```
1. None of the `SearchBox` controller options are required, but you can use them to tailor the controller instance to your needs.

```typescript
// src/Components/MyAuthorFacet.ts
 
import { Facet, FacetOptions, buildFacet } from '@coveo/headless';
import { engine } from '../Engine';
 
const options: FacetOptions = { field: "author" }; ①
 
const myAuthorFacet: Facet = buildFacet(engine, { options });
```
1. Specifying a `field` value in the options object is required to initialize a `Facet` controller instance.

The options that are available on each controller are detailed in the [reference documentation](https://docs.coveo.com/en/headless/latest/reference/index.html).

### Interact With a Controller

The different Headless engines expose different controllers, and each controller exposes a public interface which you can use to interact with its Headless engine’s state.

When you call a method on a controller instance, one or more actions are dispatched. The target Headless engine’s reducers listen to those actions, and react to them by altering the state as necessary.

Calling some of the `SearchBox` controller’s methods.

```typescript
import { SearchBox, buildSearchBox } from '@coveo/headless';
import { engine } from '../Engine';

const mySearchBox: SearchBox = buildSearchBox(engine);
 
mySearchBox.updateText('hello'); ①
 
mySearchBox.selectSuggestion(mySearchBox.state.suggestions[0].value) ②
```
1. Dispatches actions to update the query to `hello`, and fetch new query suggestions.
2. Dispatches actions to set the query to the value of the first query suggestion (for example, `hello world`), and execute that query.

The methods that are available on each controller are detailed in the [reference documentation](https://docs.coveo.com/en/headless/latest/reference/index.html).

### Subscribe to State Changes

You can use the `subscribe` method on a controller instance to listen to its state changes.

The listener function you pass when calling the `subscribe` method will be executed every time an action is dispatched.

```typescript
import { SearchBox, buildSearchBox } from '@coveo/headless';
import { engine } from '../Engine';

const mySearchBox: SearchBox = buildSearchBox(engine);
 
// ...
 
function onSearchBoxUpdate() {
  const state = mySearchBox.state;
  // ...Do something with the updated SearchBox state...
}
 
const unsubscribe = mySearchBox.subscribe(onSearchBoxUpdate); ①
 
mySearchBox.updateText('hello'); ②
 
// ...
 
unsubscribe(); ③
```
1. Every time the portion of the state that’s relevant for the `SearchBox` controller changes, the `onSearchBoxUpdate` function will be called.
2. This will trigger a `SearchBox` state change.
3. The `subscribe` method returns an `unsubscribe` method which you can call to stop listening for state updates (for example, when the controller is deleted).

You can also call the `subscribe` method from your Headless engine instance to listen to all state changes.

```typescript
import { engine } from '../Engine';
 
function onStateUpdate() {
  const state = engine.state;
  // ...Do something with the updated state...
}
 
const unsubscribe = engine.subscribe(onStateUpdate);
 
// ...
 
unsubscribe();
```

## Initialize Your Interface

Once you’ve initialized your engine and controllers, you may want to set initial search parameters, if needed, before [synchronizing the search parameters with values retrieved from the URL](https://docs.coveo.com/en/headless/latest/usage/synchronize-search-parameters-with-the-url) and finally triggering the first request.
If your application does not need to modify initial search parameters, then the next step would be to trigger the first request.

In any case, be sure to modify initial search parameters, and then to synchronize with the URL, only after the engine and controllers have been initialized, lest you face timing problems.
To avoid this kind of issue, modern frameworks expose purpose-built lifecycle methods.
In React, there is [`componentDidMount`](https://reactjs.org/docs/react-component.html#componentdidmount), in Vue.js, there is [`mounted`](https://v3.vuejs.org/api/options-lifecycle-hooks.html#mounted), and in Angular there is [`ngAfterViewInit`](https://angular.io/guide/lifecycle-hooks#lifecycle-event-sequence).

```typescript
// app/SearchPage.tsx

import { headlessEngine } from './Engine'; ①
import { mySearchBox } from './Components/MySearchBox.ts'; ②
import { myAuthorFacet } from './Components/MyAuthorFacet.ts';
// ...
 
export default class App extends React.Component {
 
  render() {
    return (
      <div>
        <!-- ... -->
          <mySearchBox /> ③
        <!-- ... -->
          <myAuthorFacet />
        <!-- ... -->
      <div>
    )
  }
 
  componentDidMount() {
    this.engine.executeFirstSearch(); ④
  }
 
  // ...
}
```

1. Import the engine [you created above](https://docs.coveo.com/en/headless/latest/usage#configure-a-headless-engine).
2. Import the search box and author facet [you created above](https://docs.coveo.com/en/headless/latest/usage#initialize-a-controller-instance).
Recall that you pass the engine to each of those components.
3. Use your components to build your interface.
4. The `componentDidMount` method allows you to wait until the `mySearchBox` and `myAuthorFacet` components have been initialized and have registered their state on the engine.
You can therefore execute the first search.
If you wanted to modify search parameters and to [synchronize them with values retrieved from the URL](https://docs.coveo.com/en/headless/latest/usage/synchronize-search-parameters-with-the-url), you would do it in this block, before executing the first search.

## Dispatch Actions

You’ll often use controller methods to interact with the state. However, you may sometimes want to dispatch actions on your own. You can create actions using action loaders and dispatch them using the Headless engine’s `dispatch` method.

```typescript
import { engine } from './engine';
import { loadFieldActions } from '@coveo/headless';
 
const FieldActionCreators = loadFieldActions(engine); ①
const action = FieldActionCreators.registerFieldsToInclude(['field1', 'field2']); ②
 
engine.dispatch(action); ③
```
1. The action loader `loadFieldActions` allows you to use field actions. Calling this function will add the necessary reducers to the engine, if they haven’t been added already, and return an object holding the relevant action creator functions.
2. To create a dispatchable action, use the action creators that were loaded in the previous line. In this case, the `registerFieldsToInclude` method takes field names as parameters and returns an action that, when dispatched, will cause those fields to be returned as part of each search result.
3. Dispatch the action using the engine’s `dispatch` method.

<dl><dt><strong>📌 Note</strong></dt><dd>

Every action dispatch triggers the corresponding listener function.
Consequently, you should only perform costly operations, such as rendering a UI component, when the state they depend on has changed.
</dd></dl>

For more information on the various actions you can dispatch, see the [reference documentation](https://docs.coveo.com/en/headless/latest/reference/index.html).