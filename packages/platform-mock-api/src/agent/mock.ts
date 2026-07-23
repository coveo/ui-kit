import type {DefaultBodyType, HttpHandler, HttpResponse} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import {headAnswerResponse, followUpAnswerResponse} from './generate-response.js';

export class MockAgentApi implements MockApi {
  readonly answerEndpoint;
  readonly followUpEndpoint;

  private followUpAnswerIndex = 0;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.answerEndpoint = new EndpointHarness<() => HttpResponse<DefaultBodyType>>(
      'POST',
      `${basePath}/api/v1/organizations/:orgId/agents/:agentId/answer`,
      headAnswerResponse,
      (response) => response()
    );

    this.followUpEndpoint = new EndpointHarness<() => HttpResponse<DefaultBodyType>>(
      'POST',
      `${basePath}/api/v1/organizations/:orgId/agents/:agentId/follow-up`,
      () => followUpAnswerResponse(++this.followUpAnswerIndex),
      (response) => response()
    );
  }

  get handlers(): HttpHandler[] {
    return [this.answerEndpoint.generateHandler(), this.followUpEndpoint.generateHandler()];
  }

  clearAll(): void {
    this.answerEndpoint.clear();
    this.followUpEndpoint.clear();
    this.followUpAnswerIndex = 0;
  }
}
