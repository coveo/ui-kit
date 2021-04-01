import pino from 'pino';
import {MLAPIClient, MLAPIClientOptions} from './ml-api-client';
import {
  NoopPreprocessRequestMiddleware,
  PlatformClient,
  PlatformClientCallOptions,
  platformUrl,
} from '../platform-client';
import {createMockUserProfileState} from '../../test/mock-user-profile-state';
import {buildMockMLAPIClient} from '../../test/mock-ml-api-client';
import {UserProfileAppState} from '../../state/user-profile-app-state';
import {buildUserActionsRequest} from '../../features/user-profile/user-profile-actions';
import {NoopPreprocessRequest} from '../preprocess-request';

jest.mock('../platform-client');
describe('machine learning api client', () => {
  const mockOptions: MLAPIClientOptions = {
    renewAccessToken: async () => 'newToken',
    logger: pino({level: 'silent'}),
  };
  let client: MLAPIClient;
  let state: UserProfileAppState;

  beforeEach(() => {
    client = buildMockMLAPIClient();
    state = createMockUserProfileState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`when calling MLAPIClient.userActions
  should call PlatformClient.call with the right options`, () => {
    const req = buildUserActionsRequest(state);
    const url = `${platformUrl()}/rest/organizations/${
      req.organizationId
    }/machinelearning/user/actions`;
    client.userActions(req);

    const expectedRequest: PlatformClientCallOptions = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url,
      ...mockOptions,
      requestParams: {
        userId: state.userProfile.userId,
      },
      preprocessRequest: NoopPreprocessRequest,
      deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });
});
