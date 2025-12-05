---
title: Modify requests and responses
group: Usage
slug: usage/modify-requests-and-responses
---
# Modify requests and responses
You may also want to modify responses before [Headless](https://docs.coveo.com/en/lcdf0493/) controllers use them.
This article explains how to do so.

## Modify requests

To modify requests sent to the Coveo Search or Usage Analytics APIs, use the `preprocessRequest` method of the target engine configuration (for example, [search](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngineConfiguration.html) or [recommendation](https://docs.coveo.com/en/headless/latest/reference/interfaces/Recommendation.RecommendationEngineConfiguration.html), depending on your use case).

<dl><dt><strong>❗ IMPORTANT</strong></dt><dd>

The `preprocessRequest` method is a powerful tool, and it can be leveraged to do things that should be done in a different manner.
For example, you can use it to set [`aq`](https://docs.coveo.com/en/175/), but you should use the [Headless](https://docs.coveo.com/en/lcdf0493/) [`AdvancedSearchQuery`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.AdvancedSearchQueryActionCreators.html) action instead.

If you have to use `preprocessRequest`, you should code defensively.
For example, you can implement [`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try%2E%2E%2Ecatch) to prevent errors.
</dd></dl>

```javascript
const engine = buildSearchEngine({
  configuration: {
    // ...
    preprocessRequest: (request, clientOrigin, metadata) => { ①
      if (metadata?.method === 'search' && clientOrigin === 'searchApiFetch') {
        const body = JSON.parse(request.body);
        // E.g., modify facet requests
        // body.facets = [...];
        request.body = JSON.stringify(body);
      }

      if (clientOrigin === 'analyticsFetch') {
        // E.g., send data to a third party
      }

      return request;
    },
  },
});
```

1. Initialize the function with its parameters:
   * `request`: The HTTP request sent to Coveo. See [`preprocess-request.ts`](https://github.com/coveo/ui-kit/blob/master/packages/headless/src/api/preprocess-request.ts).
   * `clientOrigin`: The origin of the request. See [`preprocess-request.ts`](https://github.com/coveo/ui-kit/blob/master/packages/headless/src/api/preprocess-request.ts).
   * `metadata`: Optional metadata consisting of two properties:

     * `method`: The method called on the client.
     * `origin`: The origin of the client that helps to distinguish between features while using the same method.

     See [`search-metadata.ts`](https://github.com/coveo/ui-kit/blob/master/packages/headless/src/api/search/search-metadata.ts).

## Modify responses

If you’re using the search engine, you can leverage the [search configuration options](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchConfigurationOptions.html) to modify Search API responses before [Headless](https://docs.coveo.com/en/lcdf0493/) controllers use them.
Use the `preprocessSearchResponseMiddleware`, `preprocessFacetSearchMiddleware`, or `preprocessQuerySuggestResponseMiddleware` method, depending on the target endpoint.

```javascript
const engine = buildSearchEngine({
  configuration: {
    // ...
    search: {
      preprocessSearchResponseMiddleware: (response) => {
        response.body.results.forEach((result) => {
          // E.g., modify the result object
          return result;
        });
        return response;
      },
      preprocessFacetSearchResponseMiddleware: (response) => response,
      preprocessQuerySuggestResponseMiddleware: (response) => response,
    },
  },
});
```