---
title: Proxy
group: Usage
slug: usage/proxy
---
# Headless proxy

Coveo Headless engines and certain actions expose `proxyBaseUrl` options.
You should only set this advanced option if you need to proxy Coveo API requests through your own server.
In most cases, you shouldn’t set this option.

By default, no proxy is used and the Coveo API requests are sent directly to the Coveo platform through [organization endpoints](https://docs.coveo.com/en/mcc80216/) resolved from the `ORGANIZATION_ID` and `ENVIRONMENT` values provided in your engine configuration, such as `<ORGANIZATION_ID>.org.coveo.com` or `<ORGANIZATION_ID>.org<ENVIRONMENT>.coveo.com`, if the `ENVIRONMENT` values is specified and different from `prod`.

If you set this option, you must also implement the required proxy endpoints in your server, otherwise the Headless engine won’t work properly.
The exact endpoints you need to implement depend on the `proxyBaseUrl` you want to set.

## Analytics

**Example**

```ts
import { buildSearchEngine } from '@coveo/headless';

const searchEngine = buildSearchEngine({
  organizationId: 'my-org-id',
  accessToken: 'my-access-token',
  analytics: {
    proxyBaseUrl: 'https://search-proxy.example.com',
  },
});
```

If you set the `proxyBaseUrl` option in your engine analytics configuration, you must also implement the correct proxy endpoints in your server, depending on the `analyticsMode` you’re using.

If you’re using the `next` analytics mode, you must implement the following proxy endpoints:

* `POST` `/` to proxy requests to `POST` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/organizations/{ORGANIZATION_ID}/events/v1`](https://platform.cloud.coveo.com/docs?urls.primaryName=Event#/Event%20API/rest_organizations_paramId_events_v1_post)
* `POST` `/validate` to proxy requests to `POST` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/organizations/{ORGANIZATION_ID}/events/v1/validate`](https://platform.cloud.coveo.com/docs?urls.primaryName=Event#/Event%20API/rest_organizations_paramId_events_v1_validate_post)

The [Event Protocol Reference](https://docs.coveo.com/en/n9da0377) provides documentation on the analytics event schemas that can be passed as request bodies to the above endpoints.

If you’re using the `legacy` analytics mode, your `proxyBaseUrl` must end with `/rest/v15/analytics`, and you must implement the following proxy endpoints:

* `POST` `/click` to proxy requests to `POST` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/click`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/post__v15_analytics_click)
* `POST` `/collect` to proxy requests to `POST` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/collect`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/post__v15_analytics_collect)
* `POST` `/custom` to proxy requests to `POST` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/custom`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/post__v15_analytics_custom)
* `GET` `/monitoring/health` to proxy requests to `GET` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/monitoring/health`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/get__v15_analytics_monitoring_health)
* `POST` `/search` to proxy requests to `POST` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/search`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/post__v15_analytics_search)
* `POST` `/searches` to proxy requests to `POST` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/searches`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/post__v15_analytics_searches)
* `GET` `/status` to proxy requests to `GET` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/status`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/get__v15_analytics_status)
* `POST` `/view` to proxy requests to `POST` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/view`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/post__v15_analytics_view)
* `DELETE` `/visit` to proxy requests to `DELETE` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/visit`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/delete__v15_analytics_visit)
* `GET` `/visit` to proxy requests to `GET` [`<ORGANIZATION_ID>.analytics.org<ENVIRONMENT|>.coveo.com/rest/v15/analytics/visit`](https://docs.coveo.com/en/18#tag/Analytics-API-Version-15/operation/get__v15_analytics_visit)

## Search

**Example**

```ts
import { buildSearchEngine } from '@coveo/headless';

const searchEngine = buildSearchEngine({
  organizationId: 'my-org-id',
  accessToken: 'my-access-token',
  search: {
    proxyBaseUrl: 'https://search-proxy.example.com',
  },
});
```

If you’re setting the `proxyBaseUrl` option in your search engine or action configuration, you must also implement the correct proxy endpoints in your server, depending on the search API requests you want to proxy.

* `POST` `/` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2`](https://docs.coveo.com/en/13#tag/Search-V2/operation/searchUsingPost)
* `POST` `/plan` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/plan`](https://docs.coveo.com/en/13#tag/Search-V2/operation/planSearchUsingPost)
* `POST` `/querySuggest` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/querySuggest`](https://docs.coveo.com/en/13#tag/Search-V2/operation/querySuggestPost)
* `POST` `/facet` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/facet`](https://docs.coveo.com/en/13#tag/Search-V2/operation/facetSearch)
* `POST` `/html` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/html`](https://docs.coveo.com/en/13#tag/Search-V2/operation/htmlPost)
* `GET` `/fields` to proxy requests to `GET` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/fields`](https://docs.coveo.com/en/13#tag/Search-V2/operation/fields)

## Case Assist

**Example**

```ts
import { buildCaseAssistEngine } from '@coveo/headless/case-assist';

const caseAssistEngine = buildCaseAssistEngine({
  caseAssistId: 'my-case-assist-id',
  organizationId: 'my-organization-id',
  accessToken: 'my-access-token',
  proxyBaseUrl: 'https://case-assist-proxy.example.com',
});
```

If you’re setting the `proxyBaseUrl` option in your case assist engine, action or state configuration, you must also implement the following proxy endpoints in your server, otherwise the case assist engine won’t work properly:

* `POST` `/classify` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/caseassists/<CASE_ASSIST_ID>/classify`](https://docs.coveo.com/en/3430#tag/Case-Assist/operation/postClassify)
* `POST` `/documents/suggest` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/caseassists/<CASE_ASSIST_ID>/documents/suggest`](https://docs.coveo.com/en/3430#tag/Case-Assist/operation/getSuggestDocument)

## Commerce

**Example**

```ts
import { buildCommerceEngine } from '@coveo/headless/commerce';

const commerceEngine = buildCommerceEngine({
  configuration: {
    organizationId: 'my-org-id',
    accessToken: 'my-access-token',
    proxyBaseUrl: 'https://commerce-proxy.example.com',
  },
});
```

If you’re setting the `proxyBaseUrl` option in your commerce engine or action configuration, you must also implement the following proxy endpoints in your server, otherwise the commerce engine won’t work properly:

* `POST` `/facet` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/commerce/v2/facet`](https://docs.coveo.com/en/103#tag/Facet/operation/facet)
* `POST` `/listing` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/commerce/v2/listing`](https://docs.coveo.com/en/103#tag/Listings/operation/getListing)
* `POST` `/productSuggest` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/commerce/v2/search/productSuggest`](https://docs.coveo.com/en/103#tag/Search/operation/productSuggest)
* `POST` `/querySuggest` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/commerce/v2/search/querySuggest`](https://docs.coveo.com/en/103#tag/Search/operation/querySuggest)
* `POST` `/recommendations` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/commerce/v2/recommendations`](https://docs.coveo.com/en/103#tag/Recommendations/operation/recommendations)
* `POST` `/search` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/commerce/v2/search`](https://docs.coveo.com/en/103#tag/Search/operation/search)

## Insight engine

**Example**

```ts
import { buildInsightEngine } from '@coveo/headless/insight';

const searchEngine = buildInsightEngine({
  organizationId: 'my-org-id',
  accessToken: 'my-access-token',
  search: {
    proxyBaseUrl: 'https://insight-proxy.example.com',
  },
});
```

If you’re setting the `proxyBaseUrl` option in your insight engine configuration, you must also implement the following proxy endpoints in your server, otherwise the insight engine won’t work properly:

* `GET` `/interface` to proxy requests to `GET` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/insight/v1/configs/<CONFIG_ID>/interface`](https://docs.coveo.com/en/3430#tag/Insight-Panel/operation/insight-panel-interface-get)
* `POST` `/querySuggest` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/insight/v1/configs/<CONFIG_ID>/querySuggest`](https://docs.coveo.com/en/3430#tag/Insight-Panel/operation/insight-panel-query-suggest)
* `GET` `/quickview` to proxy requests to `GET` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/insight/v1/configs/<CONFIG_ID>/quickview`](https://docs.coveo.com/en/3430#tag/Insight-Panel/operation/insight-panel-quickview)
* `POST` `/search` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/organizations/<ORGANIZATION_ID>/insight/v1/configs/<CONFIG_ID>/search`](https://docs.coveo.com/en/3430#tag/Insight-Panel/operation/insight-panel-search)

## Recommendation engine

**Example**

```ts
import { buildRecommendationEngine } from '@coveo/headless/recommendation';

const RecommendationEngine = buildRecommendationEngine({
  configuration: {
    caseAssistId: 'my-case-assist-id',
    organizationId: 'my-organization-id',
    accessToken: 'my-access-token',
    proxyBaseUrl: 'https://recommendation-proxy.example.com',
  },
});
```

If you’re setting the `proxyBaseUrl` option in your recommendation engine configuration, you must also implement the following proxy endpoints in your server, otherwise the recommendation engine won’t work properly:

* `POST` `/` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2`](https://docs.coveo.com/en/13#tag/Search-V2/operation/searchUsingPost)
* `POST` `/plan` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/plan`](https://docs.coveo.com/en/13#tag/Search-V2/operation/planSearchUsingPost)
* `POST` `/querySuggest` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/querySuggest`](https://docs.coveo.com/en/13#tag/Search-V2/operation/querySuggestPost)
* `POST` `/facet` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/facet`](https://docs.coveo.com/en/13#tag/Search-V2/operation/facetSearch)
* `POST` `/html` to proxy requests to `POST` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/html`](https://docs.coveo.com/en/13#tag/Search-V2/operation/htmlPost)
* `GET` `/fields` to proxy requests to `GET` [`<ORGANIZATION_ID>.org<ENVIRONMENT|>.coveo.com/rest/search/v2/fields`](https://docs.coveo.com/en/13#tag/Search-V2/operation/fields)
