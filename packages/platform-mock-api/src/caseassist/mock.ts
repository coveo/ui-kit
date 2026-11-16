import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {
  baseResponse as baseDocumentsSuggestResponse,
  type DocumentsSuggestResponse,
} from './documents-suggest-response.js';

export class MockCaseAssistApi implements MockApi {
  readonly documentsSuggestEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.documentsSuggestEndpoint = new EndpointHarness<
      DocumentsSuggestResponse | APIErrorWithStatusCode
    >(
      'POST',
      `${basePath}/rest/organizations/:orgId/caseassists/:caseAssistId/documents/suggest`,
      baseDocumentsSuggestResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [this.documentsSuggestEndpoint.generateHandler()];
  }

  clearAll(): void {
    this.documentsSuggestEndpoint.clear();
  }
}
