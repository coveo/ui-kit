import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {baseRecommendationResponse} from './recommendation-response.js';

export class MockRecommendationApi implements MockApi {
  readonly searchEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.searchEndpoint = new EndpointHarness<
      typeof baseRecommendationResponse | APIErrorWithStatusCode
    >('POST', `${basePath}/rest/search/v2`, baseRecommendationResponse);
  }

  get handlers(): HttpHandler[] {
    return [this.searchEndpoint.generateHandler()];
  }

  clearAll(): void {
    this.searchEndpoint.clear();
  }
}
