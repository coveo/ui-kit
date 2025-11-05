import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {baseResponse as baseUserActionsResponse} from './user-actions-response.js';

export class MockMachineLearningApi implements MockApi {
  readonly userActionsEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.userActionsEndpoint = new EndpointHarness<
      typeof baseUserActionsResponse | APIErrorWithStatusCode
    >(
      'POST',
      `${basePath}/rest/organizations/:orgId/machinelearning/user/actions`,
      baseUserActionsResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [this.userActionsEndpoint.generateHandler()];
  }
}
