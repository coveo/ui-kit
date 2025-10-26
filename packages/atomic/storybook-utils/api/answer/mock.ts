import type {DefaultBodyType, HttpHandler, HttpResponse} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import {baseResponse as baseGeneratedAnswer} from './generate-response.js';

export class MockAnswerApi implements MockApi {
  readonly generateEndPoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.generateEndPoint = new EndpointHarness<
      () => HttpResponse<DefaultBodyType>
    >(
      'POST',
      `${basePath}/rest/organizations/:orgId/answer/v1/configs/:configId/generate`,
      baseGeneratedAnswer,
      (response) => response()
    );
  }

  get handlers(): HttpHandler[] {
    return [this.generateEndPoint.generateHandler()];
  }
}
