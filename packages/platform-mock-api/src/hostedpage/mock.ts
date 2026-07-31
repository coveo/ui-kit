import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {baseResponse, type HostedPageResponse} from './hostedpage-response.js';

type Response = HostedPageResponse | APIErrorWithStatusCode;

export class MockHostedPageApi implements MockApi {
  readonly builderEndpoint;
  readonly trialEndpoint;
  readonly codeEndpoint;

  constructor(basePath: string = 'https://:orgId.admin.org.coveo.com') {
    const organizationPath = `${basePath}/rest/organizations/:orgId`;

    this.builderEndpoint = new EndpointHarness<Response>(
      'GET',
      `${organizationPath}/searchpage/v1/interfaces/:pageId/json`,
      baseResponse
    );
    this.trialEndpoint = new EndpointHarness<Response>(
      'GET',
      `${organizationPath}/searchinterfaces/:pageId/hostedpage/v1`,
      baseResponse
    );
    this.codeEndpoint = new EndpointHarness<Response>(
      'GET',
      `${organizationPath}/hostedpages/:pageId`,
      baseResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [
      this.builderEndpoint.generateHandler(),
      this.trialEndpoint.generateHandler(),
      this.codeEndpoint.generateHandler(),
    ];
  }

  clearAll(): void {
    this.builderEndpoint.clear();
    this.trialEndpoint.clear();
    this.codeEndpoint.clear();
  }
}
