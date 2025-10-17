import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import {baseResponse as baseQuerySuggestResponse} from './querySuggest-response.js';
import {
  baseResponse as baseSearchResponse,
  validateResponse as validateSearchResponse,
} from './search-response.js';

export class MockSearchApi implements MockApi {
  readonly searchEndpoint;
  readonly querySuggestEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.searchEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/search/v2`,
      baseSearchResponse,
      validateSearchResponse
    );
    this.querySuggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/search/v2/querySuggest`,
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

// TODO: Remove exports once the concept is fully internalized.
export {baseSearchResponse};
