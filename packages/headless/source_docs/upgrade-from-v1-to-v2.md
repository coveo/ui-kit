---
title: v1 to v2
group: Upgrade
slug: upgrade/v1-to-v2
---
# Upgrade from v1 to v2

> [!IMPORTANT]
>
> The following are breaking changes from Headless v1 to v2.

## Renamed variables

The following elements were renamed without changes to their underlying functionality.

* `RelevanceInspector.fetchFieldDescriptions` renamed to `RelevanceInspector.fetchFieldsDescription`

  **Headless Version 1**

  ```js
  <button onClick={() => controller.fetchFieldDescriptions()}></button>
  ```

  **Headless Version 2**

  ```js
  <button onClick={() => controller.fetchFieldsDescription()}></button>
  ```

  Documentation: [RelevanceInspector](../../interfaces/Search.RelevanceInspector.html)
* `RelevanceInspectorState.fieldDescriptions` renamed to `RelevanceInspectorState.fieldDescription`

  Documentation: [RelevanceInspector](../../interfaces/Search.RelevanceInspector.html)
* `ResultListState.searchUid` renamed to `ResultListState.searchResponseId`

  Documentation: [ResultList](../../interfaces/Search.ResultList.html)
* `searchAPIClient` renamed to `apiClient`

  Documentation: [SearchActions](../../interfaces/Search.SearchActionCreators.html)

## Changes

### CDN

<span>https://</span>static.cloud.coveo.com/headless/latest/* resources will no longer be updated (also, using this wasn’t recommended).
If you want to use the CDN instead of [using npm to install Headless](../usage/index.html#install-headless), specify a major version to follow updates, such as in <span>https://</span>static.cloud.coveo.com/headless/v2/*.

**Headless Version 1**

```html
<script type="module" src="https://static.cloud.coveo.com/headless/latest/headless.esm.js"></script>
```

or

```html
<script type="module" src="https://static.cloud.coveo.com/headless/v1/headless.esm.js"></script>
```

**Headless Version 2**

```html
<script type="module" src="https://static.cloud.coveo.com/headless/v2/headless.esm.js"></script>
```

### [`FieldSuggestionsOptions`](../../interfaces/Search.FieldSuggestionsOptions.html)

Except for the `delimitingCharacter` option, which had no effect and has been removed completely, the options exposed through `FieldSuggestionsOptions` have been removed.
They must now be set by passing a [`FacetOptions`](../../interfaces/Search.FacetOptions.html) object.

**Headless Version 1 Example**

```ts
controller = buildFieldSuggestions(engine, {field: 'author', facetId: 'author-2'});
```

**Headless Version 2 Example**

```ts
controller = buildFieldSuggestions(engine, {facet: {field: 'author', facetId: 'author-2'}});
```

Similarly, the `FieldSuggestionsFacetSearchOptions` have been removed and you must use `FacetSearchOptions` instead.
Because they expose the same attributes, this change should be transparent.

**Headless Version 1 Example**

```ts
controller = buildFieldSuggestions(engine, {field: 'author', facetId: 'author-2', facetSearch: {query: "herman"}});
```

**Headless Version 2 Example**

```ts
controller = buildFieldSuggestions(engine, {facet: {field: 'author', facetId: 'author-2', facetSearch: {query: "herman"}}});
```

### [`CategoryFieldSuggestionsOptions`](../../interfaces/Search.CategoryFieldSuggestionsOptions.html)

Except for the `delimitingCharacter` option, which had no effect and has been removed completely, the options exposed through `CategoryFieldSuggestionsOptions` have been removed and must now be set by passing a [`CategoryFacetOptions`](../../interfaces/Search.CategoryFacetOptions.html) object.

**Headless Version 1 Example**

```ts
controller = buildCategoryFieldSuggestions(engine, {
  options: {
    field: 'geographicalhierarchy',
    facetId: 'geographicalhierarchy-3',
  }
});
```

**Headless Version 2 Example**

```ts
controller = buildCategoryFieldSuggestions(engine, {
  options: {
    facet: {
      field: 'geographicalhierarchy',
      facetId: 'geographicalhierarchy-3',
    }
  }
});
```

Similarly, the `CategoryFieldSuggestionsFacetSearchOptions` have been removed and you must use `CategoryFacetSearchOptions` instead.
Because they expose the same attributes, this change should be transparent.

**Headless Version 1 Example**

```ts
controller = buildCategoryFieldSuggestions(engine, {
  options: {
    field: 'geographicalhierarchy',
    facetId: 'geographicalhierarchy-3',
    facetSearch: {query: "brazil"}
  }
});
```

**Headless Version 2 Example**

```ts
controller = buildCategoryFieldSuggestions(engine, {
  options: {
    facet: {
      field: 'geographicalhierarchy',
      facetId: 'geographicalhierarchy-3',
      facetSearch: {query: "brazil"}
    }
  }
});
```

### [`UrlManager`](../../interfaces/Search.UrlManager.html)

The `UrlManager` now serializes facets with a dash instead of brackets.

For instance, `f[my-facet]=valueA,valueB` in v1 is serialized as `f-my-facet=valueA,valueB` in v2.

The `UrlManager` generally handles this part of the serialization and deserialization by itself, so the changes should be transparent, unless you were leveraging the URL directly somehow, for example by linking to your search page with preselected facets.
In that case, adjust to the new serialization.

**Headless Version 1 Example**

```html
<a href="https://mysite.com/search/#f[country]=canada"></a>
```

**Headless Version 2 Example**

```html
<a href="https://mysite.com/search/#f-country=canada"></a>
```

### [`BreadcrumbActionCreator`](../../interfaces/Search.BreadcrumbActionCreators.html)

`deselectAllFacets` has been removed.
Instead, use `deselectAllBreadcrumbs`.

**Headless Version 1 Example**

```ts
import { engine } from './engine';
import { loadBreadcrumbActions } from '@coveo/headless';

const breadcrumbActionCreators = loadBreadcrumbActions(headlessEngine);
const action = breadcrumbActionCreators.deselectAllFacets();

headlessEngine.dispatch(action);
```

**Headless Version 2 Example**

```ts
import { engine } from './engine';
import { loadBreadcrumbActions } from '@coveo/headless';

const breadcrumbActionCreators = loadBreadcrumbActions(headlessEngine);
const action = breadcrumbActionCreators.deselectAllBreadcrumbs();

headlessEngine.dispatch(action);
```

### [`DateRangeOptions`](../../interfaces/Search.DateRangeOptions.html)

The `useLocalTime` option was removed.

In v2, if you don’t want to use the local time, use [`SearchConfigurationOptions.timezone`](../../interfaces/Search.SearchConfigurationOptions.html) instead.
By default, the user local time is used.
To change it, specify the target `timezone` value when initializing your search interface.

**Headless Version 1 Example**

```ts
const controller = buildDateFacet(engine, {
  options: {
    field: 'created',
    generateAutomaticRanges: false,
    currentValues: [
      buildDateRange({
        start: {period: 'past', unit: 'day', amount: 1},
        end: {period: 'now'},
        useLocalTime: false,
      }),
      buildDateRange({
        start: {period: 'past', unit: 'week', amount: 1},
        end: {period: 'now'},
        useLocalTime: false,
      }),
    ],
  },
});
```

**Headless Version 2 Example**

```ts
import { buildSearchEngine } from '@coveo/headless';

export const headlessEngine = buildSearchEngine({
  configuration: {
    // ...
    search: {
        timezone: 'Etc/UTC'
    }
  }
});
```

### [`SmartSnippetRelatedQuestion`](../../interfaces/Search.SmartSnippetRelatedQuestion.html)

The `documentId` property has been removed.
Use `questionAnswerId` instead.

In particular, you now need to use `questionAnswerId` rather than `documentId` when using the following methods:

* [`collapse`](../../interfaces/Search.SmartSnippetQuestionsList.html#collapse)
* [`expand`](../../interfaces/Search.SmartSnippetQuestionsList.html#expand)

The same applies when using the following actions:

* [`collapseSmartSnippetRelatedQuestion`](../../interfaces/Search.QuestionAnsweringActionCreators.html#collapsesmartsnippetrelatedquestion)
* [`expandSmartSnippetRelatedQuestion`](../../interfaces/Search.QuestionAnsweringActionCreators.html#expandsmartsnippetrelatedquestion)
* [`logOpenSmartSnippetSuggestionSource`](../../interfaces/Search.ClickAnalyticsActionCreators.html#logopensmartsnippetsuggestionsource)
* [`logExpandSmartSnippetSuggestion`](../../interfaces/Search.SearchAnalyticsActionCreators.html#logexpandsmartsnippetsuggestion)
* [`logCollapseSmartSnippetSuggestion`](../../interfaces/Search.SearchAnalyticsActionCreators.html#logcollapsesmartsnippetsuggestion)

**Headless Version 1 Example**

```ts
// ...

export const SmartSnippetQuestionsList: FunctionComponent<
  SmartSnippetQuestionsListProps
> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  const {questions} = state;

  // ...

  return (
    <div style={{textAlign: 'left'}}>
      People also ask:
      <dl>
        {questions.map((question) => {
          return (
            <>
              <dt>{question.question}</dt>
              <dd>
                <!-- ... -->
                <button
                  style={{display: question.expanded ? 'none' : 'block'}}
                  onClick={() => controller.expand(question.documentId)}
                >
                  Show answer
                </button>
                <button
                  style={{display: question.expanded ? 'block' : 'none'}}
                  onClick={() => controller.collapse(question.documentId)}
                >
                  Hide answer
                </button>
              </dd>
            </>
          );
        })}
      </dl>
    </div>
  );
};
```

**Headless Version 2 Example**

```ts
// ...

export const SmartSnippetQuestionsList: FunctionComponent<
  SmartSnippetQuestionsListProps
> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  const {questions} = state;

  // ...

  return (
    <div style={{textAlign: 'left'}}>
      People also ask:
      <dl>
        {questions.map((question) => {
          return (
            <>
              <dt>{question.question}</dt>
              <dd>
                <!-- ... -->
                  <button
                    style={{display: question.expanded ? 'none' : 'block'}}
                    onClick={() =>
                      this.controller.expand(question.questionAnswerId)}
                  >
                    Show answer
                  </button>
                  <button
                    style={{display: question.expanded ? 'block' : 'none'}}
                    onClick={() =>
                      this.controller.collapse(question.questionAnswerId)}
                  >
                    Hide answer
                  </button>
              </dd>
            </>
          );
        })}
      </dl>
    </div>
  );
};
```

### [`logOpenSmartSnippetSource`](../../interfaces/Search.ClickAnalyticsActionCreators.html#logopensmartsnippetsource)

This action no longer requires the `source` parameter to be specified.
Headless infers it automatically.

**Headless Version 1**

```ts
// ...
engine.dispatch(logOpenSmartSnippetSource(result));
```

**Headless Version 2**

```ts
// ...
engine.dispatch(logOpenSmartSnippetSource());
```

### [`NotifyTrigger`](../../interfaces/Search.NotifyTrigger.html)

The controller state `notification` property has been replaced by the `notifications` property, which is an array that could contain multiple notifications.

**Headless Version 1 Example**

```ts
const notify = () => {
  if (state.notification) {
    alert('Notification: ' + state.notification);
  }
};
```

**Headless Version 2 Example**

```ts
const notify = () => {
  state.notifications.forEach((notification) => {
    alert('Notification: ' + notification);
  });
};
```

### [`ExecuteTrigger`](../../interfaces/Search.ExecuteTrigger.html)

`engine.state.triggers.executed` has been replaced by `engine.state.triggers.executions`, which is an array that could contain multiple executions.
Also, `functionName` and `params` have been removed from `engine.state.triggers` and moved to the executions in the `engine.state.triggers.executions` array.

**Headless Version 1 Example**

```ts
// ...

export class ExecuteTrigger extends Component<{}, ExecuteTriggerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessExecuteTrigger;
  private unsubscribe: Unsubscribe = () => {};

  // ...

  componentDidMount() {
    this.controller = buildExecuteTrigger(this.context.engine!);
    this.unsubscribe = this.controller.subscribe(() => this.executeFunction());
  }

  private executeFunction = () => {
    const {functionName, params} = this.controller.state;
    // ...
  };

  // ...
}
```

**Headless Version 2 Example**

```ts
// ...

export class ExecuteTrigger extends Component<{}, ExecuteTriggerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessExecuteTrigger;
  private unsubscribe: Unsubscribe = () => {};

  // ...

  componentDidMount() {
    this.controller = buildExecuteTrigger(this.context.engine!);
    this.unsubscribe = this.controller.subscribe(() =>
      this.controller.state.executions.forEach((execution) =>
        this.executeFunction(execution)
      )
    );
  }

  private executeFunction = (execution: FunctionExecutionTrigger) => {
    const {functionName, params} = execution;
    // ...
  };

  // ...
}
```

### [`querySuggest`](../../interfaces/Search.QuerySuggestActionCreators.html)

`engine.state.querySuggest.q` has been removed.
Instead, use the more general `engine.state.querySet`, which is also a set of [queries](https://docs.coveo.com/en/231/) (strings) available using the `id` of the target search box (see [`QuerySetActions`](../../interfaces/Search.QuerySetActionCreators.html)).

**Headless Version 1 Example**

```ts
lastQuery = engine.state.querySuggest.q
// ...
```

**Headless Version 2 Example**

```ts
this.headlessSearchBox = buildSearchBox(headlessEngine, {
  options: {
    id: '123',
    // ...
  }
  // ...
})
// ...
lastQuery = engine.state.querySet['123']
// ...
```

### [`facetSet`](../../interfaces/Search.FacetSetActionCreators.html) and [`NumericFacetSet`](../../interfaces/Search.NumericFacetSetActionCreators.html)

The type of `engine.state.facetSet` has changed from `{ [facetId: string]: FacetRequest }` to `{ [facetId: string]: FacetSlice }`.

The type of `engine.state.numericFacetSet` has changed from `{ [facetId: string]: NumericFacetRequest }` to `{ [facetId: string]: NumericFacetSlice }`.

`facetRequest`, which used to be accessible in `facetSet[<FACET_ID>]`, where `<FACET_ID>` is the ID of the target facet, is now accessible in `facetSet[<FACET_ID>].request`.

**Headless Version 1**

```ts
lastRequest = engine.state.facetSet[this.headlessFacet.state.facetId]
// ...
```

**Headless Version 2**

```ts
lastRequest = engine.state.facetSet[this.headlessFacet.state.facetId].request
// ...
```

`hasBreadcrumbs`, which used to be accessible in `facetRequest`, is now accessible in `FacetSlice`.
Since the type of `engine.state.facetSet` has changed accordingly, the behavior should remain unchanged.
In other words, the following are equivalent:

**Headless Version 1**

```ts
engine.state.facetSet[<FACET_ID>].hasBreadcrumbs
```

**Headless Version 2**

```ts
engine.state.facetSet[<FACET_ID>].hasBreadcrumbs
```

### Internal controllers removal

The following internal controllers have been removed:

* `InteractiveResultCore`
* `CoreQuerySummary`
* `CoreResultList`
* `CoreFacetManager`
* `CoreStatus`
* `DocumentSuggestion` (from the Case Assist engine)
* `QuickviewCore`

### `Redirection`

The `engine.state.redirection` reducer (not documented) and the related actions (not documented either) have been removed.
If you were using them previously, see [`StandaloneSearchBox`](../../interfaces/Search.StandaloneSearchBox.html) and [`StandaloneSearchBoxSetActions`](../../interfaces/Commerce.StandaloneSearchBoxSetActionCreators.html) instead.

### [`FacetOptions`](../../interfaces/Search.FacetOptions.html)

The `delimitingCharacter` option was removed.
It wasn’t doing anything, since delimiting characters are only relevant in category [facets](https://docs.coveo.com/en/198/).

### [Result template manager](../usage/use-result-templates.html)

Registering an invalid template now throws an error rather than just logging it.
Previously, the invalid template wouldn’t work, but it wouldn’t throw an error.
So, this change will only throw an error if you already had a result template issue.

The error could look like the following examples:

```text
Each result template conditions should be a function that takes a result as an argument and returns a boolean
```

```text
The following properties are invalid:
        content: value is required.
        conditions: value is required.
```

### `clientOrigin`

The `clientOrigin` has been changed for some Search API requests (see [Modify requests and responses](../usage/modify-requests-and-responses.html)).
This change should be transparent, unless you were modifying the `clientOrigin` yourself.

| Request |
| --- |
| `clientOrigin` value |
| Product listing |
| `commerceApiFetch` |
| Case assist |
| `caseAssistApiFetch` |
| Insight |
| `insightApiFetch` |

### Search analytics actions

All of the [`log*` search action creators](../../interfaces/Search.SearchAnalyticsActionCreators.html) now return dispatchable actions of type `PreparableAnalyticsAction` rather than `AsyncThunkAction<{ analyticsType: AnalyticsType.Search; }, void, AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>>`.
[Search actions](../../interfaces/Search.SearchActionCreators.html) now require this new type of dispatchable analytics actions to trigger.

The change should be transparent, because only the types used are different, not the use of the functions involved themselves.