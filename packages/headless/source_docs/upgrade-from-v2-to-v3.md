---
title: v2 to v3
group: Upgrade
slug: upgrade/v2-to-v3
---
# Upgrade from v2 to v3
[Headless](https://docs.coveo.com/en/lcdf0493/) v3 introduces changes and innovations that align with the latest evolution of the [Coveo Platform](https://docs.coveo.com/en/186/).

<dl><dt><strong>❗ IMPORTANT: The following are breaking changes from Headless v2 to v3</strong></dt><dd>

</dd></dl>

## Migration to Coveo Event Protocol

Coveo [Event Protocol](https://docs.coveo.com/en/headless/latest/usage/headless-usage-analytics/headless-ep/) becomes the new default protocol.
In other words, the default value of `configuration.analytics.analyticsMode` in the Engine is now `next` instead of `legacy`.

If you’re using the default value in v3 and aren’t yet ready to [migrate to the new protocol](https://docs.coveo.com/en/o88d0509/), set the value to `legacy` to continue using the Coveo UA protocol.

<dl><dt><strong>❗ IMPORTANT</strong></dt><dd>

Only [Coveo for Commerce](https://docs.coveo.com/en/1499/) supports EP at the moment.
For all other implementations, set `analyticsMode` to `legacy` when upgrading to v3.
</dd></dl>

```ts
const engine = buildSearchEngine({
    configuration: {
        // ...rest of configuration
        analytics: {analyticsMode: 'legacy'},
    }
})
```

### Removal of `analyticsClientMiddleware` function

As part of the migration to support Coveo Event Protocol (EP), [Headless](https://docs.coveo.com/en/lcdf0493/) won’t support the `analyticsClientMiddleware` property when EP is enabled.

**Headless Version 2**

```ts
const engine = buildSearchEngine({
    configuration: {
        // ...rest of configuration
        analytics: {
            analyticsClientMiddleware: (eventName: string, payload: Record<string, unknown>) => {
                // ...
            }
        }
    }
})
```

There’s no alternative when using EP, as EP is meant to be more streamlined, which results in cleaner data and more powerful [machine learning](https://docs.coveo.com/en/188/) [models](https://docs.coveo.com/en/1012/).
When using the legacy Coveo UA protocol, you can continue using `analyticsClientMiddleware`.

**Headless Version 3**

```ts
const engine = buildSearchEngine({
    configuration: {
        // ...rest of configuration
        analytics: {
            analyticsMode: 'legacy',
            analyticsClientMiddleware: (eventName: string, payload: any) => {
                // ...
            }
        }
    }
})
```

## Organization endpoints

[Organization endpoints](https://docs.coveo.com/en/mcc80216/) is a feature that improves separation of concerns and resiliency, making multi-region and data residency deployments smoother.

Starting with Headless v3, the usage of organization endpoints will be enforced automatically, as opposed to optional in v2.

**Headless Version 2**

```ts
import {buildSearchEngine} from '@coveo/headless';

const engine = buildSearchEngine({
    configuration: {
        // ...
        organizationId: '<ORGANIZATION_ID>',
        organizationEndpoints: getOrganizationEndpoints('<ORGANIZATION_ID>')
    }
})
```

**Headless Version 3**

```js
import {buildSearchEngine} from '@coveo/headless';

const engine = buildSearchEngine({
    configuration: {
        // ...
        organizationId: '<ORGANIZATION_ID>',
    }
})
```

For [HIPAA](https://docs.coveo.com/en/1853/) organizations, rather than specifying the `hipaa` argument in the `getOrganizationEndpoints` function, set the `environment` property to `hipaa` in your engine configuration.

**Headless Version 2**

```ts
import {buildSearchEngine} from '@coveo/headless';

const engine = buildSearchEngine({
    configuration: {
        // ...
        organizationId: '<ORGANIZATION_ID>',
        organizationEndpoints: getOrganizationEndpoints('<ORGANIZATION_ID>', 'hipaa')
    }
})
```

**Headless Version 3**

```js
import {buildSearchEngine} from '@coveo/headless';

const engine = buildSearchEngine({
    configuration: {
        // ...
        organizationId: '<ORGANIZATION_ID>',
        environment: 'hipaa',
    }
})
```

For most implementations, this is the extent of the changes.
However, if you used the `organizationEndpoints` property to send requests to your own proxy that relays requests to Coveo APIs, more changes are required.
Headless v3 introduces the `search.proxyBaseUrl`, `analytics.proxyBaseUrl`, and `commerce.proxyBaseUrl` engine configuration options for such cases.

**Headless Version 2**

```ts
import {buildSearchEngine} from '@coveo/headless';

const engine = buildSearchEngine({
    configuration: {
        // ...
        organizationId: 'my-org-id',
        organizationEndpoints:
            {
                ...getOrganizationEndpoints('my-org-id'),
                search: 'https://myproxy.com/search',
            }
    }
})
```

**Headless Version 3**

```js
import {buildSearchEngine} from '@coveo/headless';

const engine = buildSearchEngine({
    configuration: {
        // ...
        organizationId: 'my-org-id',
        search: {
            proxyBaseUrl: 'https://myproxy.com/search',
        },
    }
})
```

If you were using the `getOrganizationEndpoints` function for some other purpose, you can use the new `getOrganizationEndpoint`, `getAdministrationOrganizationEndpoint`, `getSearchApiBaseUrl` or `getAnalyticsNextApiBaseUrl` functions instead.

**Headless Version 2**

```ts
const organizationEndpoints: getOrganizationEndpoints('<ORGANIZATION_ID>');
const searchEndpoint = organizationEndpoints.search;
// ...
```

**Headless Version 3**

```js
const searchEndpoint = getSearchApiBaseUrl('<ORGANIZATION_ID>');
// ...
```

### `platformUrl` property

The `platformUrl` property, which was previously deprecated, has been removed from all engine configuration options.
This property was originally used to specify [Organization endpoints](https://docs.coveo.com/en/mcc80216/), but the `organizationEndpoints` property has since replaced it.
As organization endpoints are now mandatory, the `platformUrl` property is no longer needed.

## Node version support

The minimum [version of Node.js](https://nodejs.org/en/about/previous-releases) supported by Headless is now 20.

This is strictly for clients bundling and building their front-end application through a Node based toolchain and including Headless as a project dependency.

## Exports

Headless exports multiple entry points each meant to support different use cases and environments.
To improve the inter-operability of Headless with different industry standard tools, and to guide those tools to properly use the appropriate entry points depending on the use case, Headless will start enforcing and specifying [export fields in package.json](https://nodejs.org/api/packages.html#modules-packages).
This means that implementation relying on non-public modules of the package will stop functioning.

**Headless Version 3**

```js
// This will be blocked entirely
import {nonPubliclyDocumentedFunction} from '@coveo/headless/dist/nonPublicFile.js';

// Will throw an error, or won't compile
nonPubliclyDocumentedFunction();
```

Also, it means you need to set `moduleResolution": "bundler"` in your `tsconfig.json` file to access secondary entry points such as `@coveo/headless/commerce` or `@coveo/headless/ssr`.
See [TypeScript module resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution) for more information.

### `moduleResolution` in `tsconfig.json` when installing via [npm](https://www.npmjs.com/)

If you use Typescript, note that the `node10`/`node` module resolution is no longer supported.
The `classic` module resolution, which was never supported, remains unsupported.

See [TypeScript module resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution) and [Announcing TypeScript 5.0 `--moduleResolution bundler`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#--moduleresolution-bundler).

### `abab` dependency

The deprecated [`abab`](https://www.npmjs.com/package/abab) npm package has been removed from Headless dependencies.
If you were using it through Headless, you’ll need to include it in your project dependencies directly.

### `TestUtils`

In v2, some internal `TestUtils` functions were exported, but weren’t meant for public use.
Those functions are no longer exported in v3.

### `createAction`, `createAsyncThunk` and `createReducer`

Those [Redux Toolkit](https://redux-toolkit.js.org/) functions are no longer re-exported by Headless.
If you’re using them, import then directly from Redux.

## Modified behaviors

### DidYouMean `queryCorrectionMode`

The [`queryCorrectionMode`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.DidYouMeanOptions.html) default value is now `next` rather than `legacy`.
This means that the default behavior of the `didYouMean` controller will be to use a [query suggestions](https://docs.coveo.com/en/1015/) [model](https://docs.coveo.com/en/1012/) for query correction rather than the legacy [index](https://docs.coveo.com/en/204/) mechanism.

### GeneratedAnswer [`sendFeedback`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#sendfeedback)

The `feedback` parameter of the `sendFeedback` method was changed.
In v2, it could have either the `GeneratedAnswerFeedback` or `GeneratedAnswerFeedbackV2` type, which were defined as follows:

**Headless Version 2**

```ts
export type GeneratedAnswerFeedback =
  | 'irrelevant'
  | 'notAccurate'
  | 'outOfDate'
  | 'harmful';

export type GeneratedAnswerFeedbackOption = 'yes' | 'unknown' | 'no';

export type GeneratedAnswerFeedbackV2 = {
  helpful: boolean;
  documented: GeneratedAnswerFeedbackOption;
  correctTopic: GeneratedAnswerFeedbackOption;
  hallucinationFree: GeneratedAnswerFeedbackOption;
  readable: GeneratedAnswerFeedbackOption;
  details?: string;
  documentUrl?: string;
};
```

In v3, only the `GeneratedAnswerFeedback` type is accepted, which was the previous `GeneratedAnswerFeedback2`.

**Headless Version 3**

```ts
export type GeneratedAnswerFeedbackOption = 'yes' | 'unknown' | 'no';

export type GeneratedAnswerFeedback = {
  helpful: boolean;
  documented: GeneratedAnswerFeedbackOption;
  correctTopic: GeneratedAnswerFeedbackOption;
  hallucinationFree: GeneratedAnswerFeedbackOption;
  readable: GeneratedAnswerFeedbackOption;
  details?: string;
  documentUrl?: string;
};
```

You must therefore adjust your code to use the new `GeneratedAnswerFeedback` type.

**Headless Version 2**

```ts
const feedback: GeneratedAnswerFeedback = 'irrelevant';
generatedAnswer.sendFeedback(feedback);
```

**Headless Version 3**

```js
const feedback: GeneratedAnswerFeedback = {
    readable: 'unknown',
    correctTopic: 'unknown',
    documented: 'yes',
    hallucinationFree: 'no',
    helpful: false,
};
generatedAnswer.sendFeedback(feedback);
```

The undocumented `logGeneratedAnswerFeedback` action was also modified the same way, accepting only `GeneratedAnswerFeedbackV2` input, which was renamed to `GeneratedAnswerFeedback`.

The undocumented `logGeneratedAnswerDetailedFeedback` action was removed in v3.

### Relevance Generative Answering (RGA) citation clicks now tracked as regular click events

As of the Headless `v3.3.0` release, Coveo [Relevance Generative Answering (RGA)](https://docs.coveo.com/en/nbtb6010/) citation clicks are now tracked as regular click events instead of custom click events in [Coveo Analytics](https://docs.coveo.com/en/182/) reports.
As a result, citation click events now have a [click rank](https://docs.coveo.com/en/2948#click-rank) value of `1`.
Additionally, the click **Event Cause** value is set to [`generatedAnswerCitationClick`](https://docs.coveo.com/en/2948#generatedanswercitationclick).

This change applies regardless of the tracking protocol (Coveo UA or Coveo [Event Protocol](https://docs.coveo.com/en/o9je0592/)) used.

### Types

The undocumented `SearchBoxSuggestionsEvent` type now takes in a search box controller and bindings as input.

**Headless Version 2**

```ts
const event: SearchBoxSuggestionsEvent,
```

**Headless Version 3**

```ts
const event: SearchBoxSuggestionsEvent<SearchBoxController, AnyBindings>,
```

## Removals

### Relevance Generative Answering (RGA) `rephrase` option

Many actions, properties, types and methods related to the Relevance Generative Answering `rephrase` option were removed or modified in v3, since the option itself is no longer supported.

* All [`rephrase`](https://docs.coveo.com/en/headless/2.80.7/reference/search/controllers/generated-answer#rephrase-method) methods were removed from all `*-generated-answer` controllers.
* The undocumented `logRephraseGeneratedAnswer` analytics action was removed.
* The undocumented `rephraseGeneratedAnswer` search action cause was removed.
* The `GeneratedResponseFormat.answerStyle` was removed from the [GeneratedAnswer `state`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#state).
* The `GeneratedAnswerStyle` type was removed.
* The undocumented `updateResponseFormat` action now only accepts the `contentFormat` option, and not the answer style.

### Sub-packages

Both `product-recommendations` and `product-listing` sub-packages are removed in v3.
Use the new `commerce` package instead.
See [Headless for commerce](https://docs.coveo.com/en/o52e9091/).

### Properties and methods

The following were removed in v3:

* [`buildCaseAssistQuickview`](https://docs.coveo.com/en/headless/2.80.7/reference/case-assist/controllers/case-assist-quickview#buildcaseassistquickview), which was a duplicate export of [`buildQuickview`](https://docs.coveo.com/en/headless/latest/reference/functions/Search.buildQuickview.html) has been removed.
* [`buildCaseAssistInteractiveResult`](https://docs.coveo.com/en/headless/2.80.7/reference/case-assist/controllers/case-assist-interactive-result#buildcaseassistinteractiveresult), which was a duplicate export of [`buildInteractiveResult`](https://docs.coveo.com/en/headless/latest/reference/functions/Search.buildInteractiveResult.html) has been removed.
* `browserPostLogHook`, which used to be exposed in the engine configuration options, has been removed.
It wasn’t doing anything.
* The quickview `onlyContentURL` initialization option has been removed from [`Quickview`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.QuickviewOptions.html) and [`CaseAssistQuickview`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Case_Assist.QuickviewOptions.html) controllers because it was always set to `true`.

  Similarly, the `content` state attribute has been removed from those controllers, as it was always empty.
* The undocumented `showMoreSmartSnippetSuggestion` and `showLessSmartSnippetSuggestion` search page events have been removed.
* [CategoryFacet `state`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.CategoryFacet.html#state) properties `parents` and `values` have been removed.
Use `valuesAsTrees` and `selectedValueAncestry` instead.

  While `values` was a flat list of all values, `valuesAsTrees` contains the root facet values, whose children, if any, are accessible via `valuesAsTrees[i].children[j]`.

  `selectedValueAncestry` is similar to `parents`, but it also includes the selected value itself.

  Depending on your implementation, the changes may or may not be transparent.

  **Headless Version 2**

  ```tsx
  private renderParents() {
      return (
          this.state.hasActiveValues && (
          <div>
              Filtering by: {this.renderClearButton()}
              {this.state.parents.map((parentValue, i) => {
              const isSelectedValue = i === this.state.parents.length - 1;

              return (
                  <span key={this.getUniqueKeyForValue(parentValue)}>
                  &rarr;
                  {!isSelectedValue ? (
                      <button
                      onClick={() => this.controller.toggleSelect(parentValue)}
                      >
                      {parentValue.value}
                      </button>
                  ) : (
                      <span>{parentValue.value}</span>
                  )}
                  </span>
              );
              })}
          </div>
          )
      );
  }

  private renderActiveValues() {
      return (
          <ul>
          {this.state.values.map((value) => (
              <li key={this.getUniqueKeyForValue(value)}>
              <button onClick={() => this.controller.toggleSelect(value)}>
                  {value.value} ({value.numberOfResults}{' '}
                  {value.numberOfResults === 1 ? 'result' : 'results'})
              </button>
              </li>
          ))}
          </ul>
      );
  }
  ```

  **Headless Version 3**

  ```tsx
  private renderParents() {
      return (
          this.state.hasActiveValues && (
          <div>
              Filtering by: {this.renderClearButton()}
              {this.state.valuesAsTrees.map((parentValue, i) => {
              const isSelectedValue = i === this.state.valuesAsTrees.length - 1;

              return (
                  <span key={this.getUniqueKeyForValue(parentValue)}>
                  &rarr;
                  {!isSelectedValue ? (
                      <button
                      onClick={() => this.controller.toggleSelect(parentValue)}
                      >
                      {parentValue.value}
                      </button>
                  ) : (
                      <span>{parentValue.value}</span>
                  )}
                  </span>
              );
              })}
          </div>
          )
      );
  }

  private renderActiveValues() {
      return (
          <ul>
          {this.state.selectedValueAncestry.map((value) => (
              <li key={this.getUniqueKeyForValue(value)}>
              <button onClick={() => this.controller.toggleSelect(value)}>
                  {value.value} ({value.numberOfResults}{' '}
                  {value.numberOfResults === 1 ? 'result' : 'results'})
              </button>
              </li>
          ))}
          </ul>
      );
  }
  ```

### Actions

#### [`logExpandToFullUI` parameters](https://docs.coveo.com/en/headless/latest/reference/interfaces/Insight.InsightSearchAnalyticsActionCreators.html#logexpandtofullui)

The `LogExpandToFullUI` action no longer uses the `caseId` and `caseNumber` parameters.
They are rather fetched automatically from the Headless engine state.

The `fullSearchComponentName` and `triggeredBy` parameters have been removed.
They had no effect.

#### `InsightCaseContextSection` actions

These undocumented actions have been removed.

### Types

The undocumented `CommerceSearchBoxSuggestionsEvent` type has been removed in V3.
If you were using this type, switch to the undocumented `SearchBoxSuggestionsEvent` type, which now accepts a search box controller and bindings as input.

**Headless Version 2**

```ts
const event: SearchBoxSuggestionsEvent,
```

**Headless Version 3**

```ts
const event: SearchBoxSuggestionsEvent<SearchBoxController, AnyBindings>,
--