import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {baseResponse as baseQuerySuggestResponse} from './querySuggest-response.js';
import {
  baseFoldedResponse,
  baseResponse as baseSearchResponse,
  type InsightResponse,
  nestedFoldedResponse,
} from './search-response.js';

export class MockInsightApi implements MockApi {
  readonly searchEndpoint;
  readonly querySuggestEndpoint;
  readonly interfaceConfigEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.searchEndpoint = new EndpointHarness<InsightResponse | APIErrorWithStatusCode>(
      'POST',
      `${basePath}/rest/organizations/:orgId/insight/v1/configs/:insightId/search`,
      baseSearchResponse
    );
    this.querySuggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/insight/v1/configs/:insightId/querySuggest`,
      baseQuerySuggestResponse
    );
    this.interfaceConfigEndpoint = new EndpointHarness(
      'GET',
      `${basePath}/rest/organizations/:orgId/insight/v1/configs/:insightId/interface`,
      {} as Record<string, never>
    );
  }

  get handlers(): HttpHandler[] {
    return [
      this.searchEndpoint.generateHandler(),
      this.querySuggestEndpoint.generateHandler(),
      this.interfaceConfigEndpoint.generateHandler(),
    ];
  }

  clearAll(): void {
    this.searchEndpoint.clear();
    this.querySuggestEndpoint.clear();
    this.interfaceConfigEndpoint.clear();
  }
}

export {baseFoldedResponse, nestedFoldedResponse};
