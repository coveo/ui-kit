import type {DefaultBodyType, HttpHandler, HttpResponse} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import {baseResponse as baseGeneratedAnswer} from './generate-response.js';

export class MockAgentApi implements MockApi {
  readonly answerEndpoint;
  readonly followUpEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.answerEndpoint = new EndpointHarness<
      () => HttpResponse<DefaultBodyType>
    >(
      'POST',
      `${basePath}/api/preview/organizations/:orgId/agents/:agentId/answer`,
      baseGeneratedAnswer,
      (response) => response()
    );

    this.followUpEndpoint = new EndpointHarness<
      () => HttpResponse<DefaultBodyType>
    >(
      'POST',
      `${basePath}/api/preview/organizations/:orgId/agents/:agentId/follow-up`,
      baseGeneratedAnswer,
      (response) => response()
    );
  }

  get handlers(): HttpHandler[] {
    return [
      this.answerEndpoint.generateHandler(),
      this.followUpEndpoint.generateHandler(),
    ];
  }

  clearAll(): void {
    this.answerEndpoint.clear();
    this.followUpEndpoint.clear();
  }
}
