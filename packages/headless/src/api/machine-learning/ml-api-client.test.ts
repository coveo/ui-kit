import {MLAPIClient} from './ml-api-client';
import {PlatformClient, platformUrl} from '../platform-client';
import {createMockUserProfileState} from '../../test/mock-user-profile-state';
import {buildMockMLAPIClient} from '../../test/mock-ml-api-client';
import {UserProfileAppState} from '../../state/user-profile-app-state';
import {buildUserActionsRequest} from '../../features/user-profile/user-profile-actions';

fdescribe('machine learning api client', () => {
  const mockPlatformCall = (mockResponse: unknown) => {
    platformCallMock = jest.fn();
    platformCallMock.mockReturnValue(mockResponse);
    PlatformClient.call = platformCallMock;
  };

  let client: MLAPIClient;
  let state: UserProfileAppState;
  let platformCallMock: jest.Mock;

  beforeEach(() => {
    client = buildMockMLAPIClient();
    state = createMockUserProfileState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userActions', () => {
    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildUserActionsRequest(state);
      const url = `${platformUrl()}/rest/organizations/${
        request.organizationId
      }/machinelearning/user/actions`;

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.userActions(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        url,
        accessToken: state.configuration.accessToken,
        requestParams: {
          objectId: state.userProfile.userId,
        },
      });
    });

    it('should call the platform endpoint with debug=1 when debug is enabled', async () => {
      state.debug = true;
      const request = buildUserActionsRequest(state);
      const url = `${platformUrl()}/rest/organizations/${
        request.organizationId
      }/machinelearning/user/actions`;

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.userActions(request);

      const expectedUrl = `${url}?debug=1`;
      expect(platformCallMock.mock.calls[0][0].url).toBe(expectedUrl);
    });

    it('should return error response on failure', async () => {
      const request = buildUserActionsRequest(state);

      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      mockPlatformCall({
        ok: false,
        json: () => Promise.resolve(expectedError),
      });

      const response = await client.userActions(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildUserActionsRequest(state);

      const expectedBody = {
        value: [
          {
            name: 'name',
            time: '123456790',
            value: 'value',
          },
        ],
        debug: false,
        internalExecutionLog: {},
        executionTime: 123940,
      };

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve(expectedBody),
      });

      const response = await client.userActions(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });
});
