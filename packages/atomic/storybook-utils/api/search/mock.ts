import {type HttpHandler, HttpResponse} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {
  baseResponse as baseFacetSearchResponse,
  type FacetSearchResponse,
} from './facetSearch-response.js';
import {baseResponse as baseHtmlResponse} from './html-response.js';
import {baseResponse as baseQuerySuggestResponse} from './querySuggest-response.js';
import {baseResponse as baseSearchResponse} from './search-response.js';

export class MockSearchApi implements MockApi {
  readonly searchEndpoint;
  readonly querySuggestEndpoint;
  readonly facetSearchEndpoint;
  readonly htmlEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    //TODO: Fix type after encoding Search API response typing properly #6481
    this.searchEndpoint = new EndpointHarness<
      typeof baseSearchResponse | APIErrorWithStatusCode
    >('POST', `${basePath}/rest/search/v2`, baseSearchResponse);
    this.querySuggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/search/v2/querySuggest`,
      baseQuerySuggestResponse
    );
    this.facetSearchEndpoint = new EndpointHarness<FacetSearchResponse>(
      'POST',
      `${basePath}/rest/search/v2/facet`,
      baseFacetSearchResponse
    );
    this.htmlEndpoint = new EndpointHarness<string>(
      'POST',
      `${basePath}/rest/search/v2/html`,
      baseHtmlResponse,
      (response, httpResponseInit) =>
        new HttpResponse(response, {
          ...httpResponseInit,
          headers: {'Content-Type': 'text/html'},
        })
    );
  }

  get handlers(): HttpHandler[] {
    return [
      this.searchEndpoint.generateHandler(),
      this.querySuggestEndpoint.generateHandler(),
      this.facetSearchEndpoint.generateHandler(),
      this.htmlEndpoint.generateHandler(),
    ];
  }
}

// TODO: Remove exports once the concept is fully internalized.
export {baseSearchResponse};
