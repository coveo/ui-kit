import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {baseResponse as baseQuerySuggestResponse} from './querySuggest-response.js';
import {
  baseResponse as baseSearchResponse,
  type InsightResponse,
} from './search-response.js';

export class MockInsightApi implements MockApi {
  readonly searchEndpoint;
  readonly querySuggestEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.searchEndpoint = new EndpointHarness<
      InsightResponse | APIErrorWithStatusCode
    >(
      'POST',
      `${basePath}/rest/organizations/:orgId/insight/v1/configs/:insightId/search`,
      baseSearchResponse
    );
    this.querySuggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/insight/v1/configs/:insightId/querySuggest`,
      baseQuerySuggestResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [
      this.searchEndpoint.generateHandler(),
      this.querySuggestEndpoint.generateHandler(),
    ];
  }
}

export {baseSearchResponse};
