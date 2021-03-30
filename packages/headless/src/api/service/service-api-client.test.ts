import {getCaseAssistInitialState} from '../../features/case-assist/case-assist-state';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {buildMockServiceAPIClient} from '../../test/mock-service-api-client';
import {PlatformClient} from '../platform-client';
import {ServiceAPIClient} from './service-api-client';
import {ClassifyParam, SuggestDocumentsParam} from './service-api-params';

describe('service api client', () => {
  const expectedOrgId = 'some org id';
  const expectedAccessToken = 'some access token';
  const expectedCaseAssistId = 'some case assist id';
  const expectedVisitorId = 'some visitor id';

  let state: CaseAssistAppState;
  let client: ServiceAPIClient;
  let platformCallMock: jest.Mock;

  beforeEach(() => {
    state = buildDefaultState();
    client = buildMockServiceAPIClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockPlatformCall = (fakeResponse: any) => {
    platformCallMock = jest.fn();

    platformCallMock.mockReturnValue(fakeResponse);
    PlatformClient.call = platformCallMock;
  };

  const buildDefaultState = (): CaseAssistAppState => ({
    configuration: {
      ...getConfigurationInitialState(),
      organizationId: expectedOrgId,
      accessToken: expectedAccessToken,
    },
    caseAssist: {
      ...getCaseAssistInitialState(),
      caseAssistId: expectedCaseAssistId,
    },
  });

  describe('classify', () => {
    const buildClassifyRequest = (
      state: CaseAssistAppState,
      debug = false
    ): ClassifyParam => ({
      url: state.configuration.platformUrl,
      organizationId: state.configuration.organizationId,
      accessToken: state.configuration.accessToken,
      caseAssistId: state.caseAssist.caseAssistId,
      visitorId: expectedVisitorId,
      locale: state.configuration.search.locale,
      fields: state.caseAssist.caseInformation,
      debug,
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      state.caseAssist.caseInformation = {subject: 'some case subject'};
      const request = buildClassifyRequest(state);

      mockPlatformCall({
        body: 'some content',
        response: {
          ok: true,
        },
      });

      await client.caseAssist.classify(request);

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

    it('should call the platform endpoint with debug=1 when debug is enabled', async () => {
      const request = buildClassifyRequest(state, true);

      mockPlatformCall({
        body: 'some content',
        response: {ok: true},
      });

      await client.caseAssist.classify(request);

      const expectedUrl = `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/classify?debug=1`;
      expect(platformCallMock.mock.calls[0][0].url).toBe(expectedUrl);
    });

    it('should return error response on failure', async () => {
      const request = buildClassifyRequest(state);

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

      const response = await client.caseAssist.classify(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildClassifyRequest(state);

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

      const response = await client.caseAssist.classify(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });

  describe('suggestDocuments', () => {
    const buildSuggestDocumentsRequest = (
      state: CaseAssistAppState,
      debug = false
    ): SuggestDocumentsParam => ({
      url: state.configuration.platformUrl,
      organizationId: state.configuration.organizationId,
      accessToken: state.configuration.accessToken,
      caseAssistId: state.caseAssist.caseAssistId,
      visitorId: expectedVisitorId,
      locale: state.configuration.search.locale,
      fields: state.caseAssist.caseInformation,
      context: state.caseAssist.userContext,
      debug,
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      state.caseAssist.caseInformation = {subject: 'some case subject'};
      state.caseAssist.userContext = {occupation: 'marketer'};
      const request = buildSuggestDocumentsRequest(state);

      mockPlatformCall({
        body: 'some content',
        response: {
          ok: true,
        },
      });

      await client.caseAssist.suggestDocuments(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        url: `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/documents/suggest`,
        accessToken: request.accessToken,
        requestParams: {
          visitorId: request.visitorId,
          locale: request.locale,
          fields: {
            subject: {
              value: request.fields.subject,
            },
          },
          context: {
            occupation: request.context?.occupation,
          },
        },
      });
    });

    it('should call the platform endpoint with debug=1 when debug is enabled', async () => {
      const request = buildSuggestDocumentsRequest(state, true);

      mockPlatformCall({
        body: 'some content',
        response: {ok: true},
      });

      await client.caseAssist.suggestDocuments(request);

      const expectedUrl = `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/documents/suggest?debug=1`;
      expect(platformCallMock.mock.calls[0][0].url).toBe(expectedUrl);
    });

    it('should return error response on failure', async () => {
      const request = buildSuggestDocumentsRequest(state);

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

      const response = await client.caseAssist.suggestDocuments(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildSuggestDocumentsRequest(state);

      const expectedBody = {
        documents: [],
        totalCount: 0,
        responseId: '071f5936-3105-45d8-92ef-f4adda584d46',
      };

      mockPlatformCall({
        body: expectedBody,
        response: {
          ok: true,
        },
      });

      const response = await client.caseAssist.suggestDocuments(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });
});
