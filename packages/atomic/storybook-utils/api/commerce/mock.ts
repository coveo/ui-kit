import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {baseResponse as baseProductSuggestResponse} from './productSuggest-response.js';
import {baseResponse as baseQuerySuggestResponse} from './querySuggest-response.js';
import {baseResponse as baseRecommendationResponse} from './recommendation-response.js';
import {baseResponse as baseSearchResponse} from './search-response.js';

export class MockCommerceApi implements MockApi {
  readonly searchEndpoint;
  readonly recommendationEndpoint;
  readonly querySuggestEndpoint;
  readonly productSuggestEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.searchEndpoint = new EndpointHarness<
      typeof baseSearchResponse | APIErrorWithStatusCode
    >(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/search`,
      baseSearchResponse
    );
    this.recommendationEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/recommendations`,
      baseRecommendationResponse
    );
    this.querySuggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/search/querySuggest`,
      baseQuerySuggestResponse
    );
    this.productSuggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/search/productSuggest`,
      baseProductSuggestResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [
      this.searchEndpoint.generateHandler(),
      this.querySuggestEndpoint.generateHandler(),
      this.productSuggestEndpoint.generateHandler(),
      this.recommendationEndpoint.generateHandler(),
    ];
  }
}

// TODO: Remove exports once the concept is fully internalized.
export {baseSearchResponse};
