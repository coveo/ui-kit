import {buildMockCaseAssistAPIClient} from '../../../test/mock-case-assist-api-client';
import {PlatformClient} from '../../platform-client';
import {CaseAssistAPIClient} from './case-assist-api-client';
import {GetCaseClassificationsRequest} from './get-case-classifications/get-case-classifications-request';
import {SuggestDocumentsRequest} from './suggest-documents/suggest-documents-request';

describe('case assist api client', () => {
  const platformUrl = 'https://platformdev.cloud.coveo.com';
  const orgId = 'some org id';
  const accessToken = 'some access token';
  const locale = 'en-CA';
  const caseAssistId = 'some case assist id';
  const visitorId = 'some visitor id';

  let client: CaseAssistAPIClient;
  let platformCallMock: jest.Mock;

  beforeEach(() => {
    client = buildMockCaseAssistAPIClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockPlatformCall = (fakeResponse: any) => {
    platformCallMock = jest.fn();

    platformCallMock.mockReturnValue(fakeResponse);
    PlatformClient.call = platformCallMock;
  };

  describe('getCaseClassifications', () => {
    const buildGetCaseClassificationsRequest = (
      req: Partial<GetCaseClassificationsRequest> = {}
    ): GetCaseClassificationsRequest => ({
      url: platformUrl,
      organizationId: orgId,
      accessToken: accessToken,
      caseAssistId: caseAssistId,
      visitorId: visitorId,
      locale: locale,
      fields: {},
      debug: false,
      ...req,
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildGetCaseClassificationsRequest({
        fields: {
          subject: 'some case subject',
        },
      });

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.getCaseClassifications(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        method: 'POST',
        contentType: 'application/json',
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
      const request = buildGetCaseClassificationsRequest({
        debug: true,
      });

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.getCaseClassifications(request);

      const expectedUrl = `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/classify?debug=1`;
      expect(platformCallMock.mock.calls[0][0].url).toBe(expectedUrl);
    });

    it('should return error response on failure', async () => {
      const request = buildGetCaseClassificationsRequest();

      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      mockPlatformCall({
        ok: false,
        json: () => Promise.resolve(expectedError),
      });

      const response = await client.getCaseClassifications(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildGetCaseClassificationsRequest();

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
        ok: true,
        json: () => Promise.resolve(expectedBody),
      });

      const response = await client.getCaseClassifications(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });

  describe('suggestDocuments', () => {
    const buildSuggestDocumentsRequest = (
      req: Partial<SuggestDocumentsRequest> = {}
    ): SuggestDocumentsRequest => ({
      url: platformUrl,
      organizationId: orgId,
      accessToken: accessToken,
      caseAssistId: caseAssistId,
      visitorId: visitorId,
      locale: locale,
      fields: {},
      debug: false,
      ...req,
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildSuggestDocumentsRequest({
        fields: {
          subject: 'some case subject',
        },
        context: {
          occupation: 'marketer',
        },
      });

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.suggestDocuments(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        method: 'POST',
        contentType: 'application/json',
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
      const request = buildSuggestDocumentsRequest({debug: true});

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.suggestDocuments(request);

      const expectedUrl = `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/documents/suggest?debug=1`;
      expect(platformCallMock.mock.calls[0][0].url).toBe(expectedUrl);
    });

    it('should call the platform endpoint with numberOfResults argument when specified', async () => {
      const request = buildSuggestDocumentsRequest({
        numberOfResults: 12,
      });

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.suggestDocuments(request);

      const expectedUrl = `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/documents/suggest?numberOfResults=12`;
      expect(platformCallMock.mock.calls[0][0].url).toBe(expectedUrl);
    });

    it('should return error response on failure', async () => {
      const request = buildSuggestDocumentsRequest();

      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      mockPlatformCall({
        ok: false,
        json: () => Promise.resolve(expectedError),
      });

      const response = await client.suggestDocuments(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildSuggestDocumentsRequest();

      const expectedBody = {
        documents: [],
        totalCount: 0,
        responseId: '071f5936-3105-45d8-92ef-f4adda584d46',
      };

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve(expectedBody),
      });

      const response = await client.suggestDocuments(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });
});
