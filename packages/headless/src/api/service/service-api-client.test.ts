import {GetClassificationsRequest} from '../../features/case-assist/case-assist-actions';
import {getCaseAssistInitialState} from '../../features/case-assist/case-assist-state';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {buildMockServiceAPIClient} from '../../test/mock-service-api-client';
import {PlatformClient} from '../platform-client';
import {ServiceAPIClient} from './service-api-client';
import {ClassifyParam} from './service-api-params';

describe('service api client', () => {
  const expectedOrgId = 'some org id';
  const expectedAccessToken = 'some access token';
  const expectedCaseAssistId = 'some case assist id';
  const expectedVisitorId = 'some visitor id';

  let state: CaseAssistAppState;
  let client: ServiceAPIClient;
  let platformCallMock: jest.Mock<any, any>;

  beforeEach(() => {
    state = buildDefaultState();
    client = buildMockServiceAPIClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const buildDefaultState = (): CaseAssistAppState => ({
    configuration: {
      ...getConfigurationInitialState(),
      organizationId: expectedOrgId,
      accessToken: expectedAccessToken,
      caseAssist: {
        caseAssistId: expectedCaseAssistId,
        visitorId: expectedVisitorId,
      },
    },
    caseAssist: getCaseAssistInitialState(),
  });

  describe('classify', () => {
    const buildClassifyRequest = (
      caseInformation: GetClassificationsRequest,
      state: CaseAssistAppState
    ): ClassifyParam => ({
      url: state.configuration.platformUrl,
      organizationId: state.configuration.organizationId,
      accessToken: state.configuration.accessToken,
      caseAssistId: state.configuration.caseAssist.caseAssistId ?? '',
      visitorId: state.configuration.caseAssist.visitorId ?? '',
      locale: state.configuration.search.locale,
      fields: caseInformation.fields,
    });

    const mockPlatformCall = (fakeResponse: any) => {
      platformCallMock = jest.fn();

      platformCallMock.mockReturnValue(fakeResponse);
      PlatformClient.call = platformCallMock;
    };

    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildClassifyRequest(
        {
          fields: {
            subject: 'some subject',
          },
        },
        state
      );

      mockPlatformCall({
        body: 'some content',
        response: {
          ok: true,
        },
      });

      await client.classify(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        url: `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/classify`,
        accessToken: request.accessToken,
        requestParams: {
          visitorId: request.visitorId,
          locale: request.locale,
          fields: {
            subject: {
              value: request.fields.subject,
            },
          },
        },
      });
    });

    it('should return error response on failure', async () => {
      const request = buildClassifyRequest({fields: {}}, state);

      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      mockPlatformCall({
        body: expectedError,
        response: {
          ok: false,
        },
      });

      const response = await client.classify(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildClassifyRequest({fields: {}}, state);

      const expectedBody = {
        fields: {
          product: {
            predictions: [
              {
                id: '02eb0cb5-15bd-5a11-8b30-de05d5d8da1b',
                value: 'tv',
                confidence: 0.987,
              },
            ],
          },
        },
        responseId: 'ba7e83ac-6b54-46c1-8789-01f144cfd3b1',
      };

      mockPlatformCall({
        body: expectedBody,
        response: {
          ok: true,
        },
      });

      const response = await client.classify(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });
});
