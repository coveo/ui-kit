import {Logger} from 'pino';
import {
  NoopPreprocessRequestMiddleware,
  PlatformClient,
} from '../platform-client';
import {BaseParam, baseMLRequest} from './ml-api-params';
import {NoopPreprocessRequest} from '../preprocess-request';
import {UserActionsRequest} from './user-profiles/user-actions-request';
import {UserActionsSuccessContent} from './user-profiles/user-actions-response';
import {UserProfileAppState} from '../../state/user-profile-app-state';
import {SearchAPIClient} from '../search/search-api-client';

export interface AsyncThunkMLRequestOptions<
  T extends Partial<UserProfileAppState>
> {
  state: T;
  rejectValue: MLAPIErrorResponse;
  extra: {
    mlAPIClient: MLAPIClient;
    searchAPIClient: SearchAPIClient;
  };
}

export interface MLAPIClientOptions {
  renewAccessToken: () => Promise<string>;
  logger: Logger;
}

export interface MLAPISuccessResponse<TContent> {
  success: TContent;
}

export interface MLAPIErrorResponse {
  error: MLAPIErrorWithStatusCode;
}

export interface MLAPIErrorWithStatusCode {
  statusCode: number;
  message: string;
  type: string;
}

export type MLAPIResponse<TSuccessContent> =
  | MLAPISuccessResponse<TSuccessContent>
  | MLAPIErrorResponse;

export class MLAPIClient {
  private defaultClientHooks = {
    preprocessRequest: NoopPreprocessRequest,
    deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
  };

  constructor(private options: MLAPIClientOptions) {}

  async userActions(
    req: UserActionsRequest
  ): Promise<MLAPIResponse<UserActionsSuccessContent>> {
    const platformResponse = await PlatformClient.call({
      ...baseMLRequest(req, 'POST', 'application/json', '/user/actions'),
      requestParams: pickNonBaseParams(req),
      ...this.options,
      ...this.defaultClientHooks,
    });

    const body = await platformResponse.json();
    return platformResponse.ok
      ? {success: body as UserActionsSuccessContent}
      : {error: body as MLAPIErrorWithStatusCode};
  }
}

function pickNonBaseParams<Params extends BaseParam>(req: Params) {
  const {url, accessToken, organizationId, ...nonBase} = req;
  return nonBase;
}

export const isErrorResponse = <T>(
  r: MLAPIResponse<T>
): r is {error: MLAPIErrorWithStatusCode} => {
  return (r as {error: MLAPIErrorWithStatusCode}).error !== undefined;
};
