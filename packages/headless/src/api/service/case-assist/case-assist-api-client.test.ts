import type {Mock} from 'vitest';
import {buildResultPreviewRequest} from '../../../features/result-preview/result-preview-request-builder.js';
import {buildMockCaseAssistAPIClient} from '../../../test/mock-case-assist-api-client.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  getOrganizationEndpoint,
  PlatformClient,
} from '../../platform-client.js';
import type {CaseAssistAPIClient} from './case-assist-api-client.js';
import type {GetCaseClassificationsRequest} from './get-case-classifications/get-case-classifications-request.js';
import type {GetDocumentSuggestionsRequest} from './get-document-suggestions/get-document-suggestions-request.js';

describe('case assist api client', () => {
  const orgId = 'some org id';
  const url = getOrganizationEndpoint(orgId, 'dev');
  const accessToken = 'some access token';
  const locale = 'en-CA';
  const caseAssistId = 'some case assist id';
  const clientId = 'some client id';

  let client: CaseAssistAPIClient;
  let platformCallMock: Mock;

  beforeEach(() => {
    client = buildMockCaseAssistAPIClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockPlatformCall = (fakeResponse: unknown) => {
    platformCallMock = vi.fn();

    platformCallMock.mockReturnValue(fakeResponse);
    PlatformClient.call = platformCallMock;
  };

  describe('getCaseClassifications', () => {
    const buildGetCaseClassificationsRequest = (
      req: Partial<GetCaseClassificationsRequest> = {}
    ): GetCaseClassificationsRequest => ({
      url: url,
      organizationId: orgId,
      accessToken: accessToken,
      caseAssistId: caseAssistId,
      clientId: clientId,
      locale: locale,
      fields: {},
      debug: false,
      ...req,
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildGetCaseClassificationsRequest({
        fields: {
          subject: {
            value: 'some case subject',
          },
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
        origin: 'caseAssistApiFetch',
        requestParams: {
          clientId: request.clientId,
          locale: request.locale,
          fields: request.fields,
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

  describe('getDocumentSuggestions', () => {
    const buildGetDocumentSuggestionsRequest = (
      req: Partial<GetDocumentSuggestionsRequest> = {}
    ): GetDocumentSuggestionsRequest => ({
      url: url,
      organizationId: orgId,
      accessToken: accessToken,
      caseAssistId: caseAssistId,
      clientId: clientId,
      locale: locale,
      fields: {},
      debug: false,
      ...req,
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildGetDocumentSuggestionsRequest({
        fields: {
          subject: {
            value: 'some case subject',
          },
        },
        context: {
          occupation: 'marketer',
        },
      });

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.getDocumentSuggestions(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        method: 'POST',
        contentType: 'application/json',
        url: `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/documents/suggest`,
        accessToken: request.accessToken,
        origin: 'caseAssistApiFetch',
        requestParams: {
          clientId: request.clientId,
          locale: request.locale,
          fields: request.fields,
          context: {
            occupation: request.context?.occupation,
          },
        },
      });
    });

    it('should call the platform endpoint with debug=1 when debug is enabled', async () => {
      const request = buildGetDocumentSuggestionsRequest({debug: true});

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.getDocumentSuggestions(request);

      const expectedUrl = `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/documents/suggest?debug=1`;
      expect(platformCallMock.mock.calls[0][0].url).toBe(expectedUrl);
    });

    it('should call the platform endpoint with numberOfResults argument when specified', async () => {
      const request = buildGetDocumentSuggestionsRequest({
        numberOfResults: 12,
      });

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.getDocumentSuggestions(request);

      const expectedUrl = `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}/documents/suggest?numberOfResults=12`;
      expect(platformCallMock.mock.calls[0][0].url).toBe(expectedUrl);
    });

    it('should return error response on failure', async () => {
      const request = buildGetDocumentSuggestionsRequest();

      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      mockPlatformCall({
        ok: false,
        json: () => Promise.resolve(expectedError),
      });

      const response = await client.getDocumentSuggestions(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildGetDocumentSuggestionsRequest();

      const expectedBody = {
        documents: [],
        totalCount: 0,
        responseId: '071f5936-3105-45d8-92ef-f4adda584d46',
      };

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve(expectedBody),
      });

      const response = await client.getDocumentSuggestions(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });

  describe('caseAssistAPIClient.html', () => {
    function encodeUTF16(str: string) {
      const buf = new ArrayBuffer(str.length * 2);
      const bufView = new Uint16Array(buf);

      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }

      return bufView;
    }

    it('when the response is UTF-16 encoded, it decodes the response correctly', async () => {
      const state = createMockState();
      const payload = encodeUTF16('hello');
      const headers = {'content-type': 'text/html; charset=UTF-16'};
      const response = new Response(payload, {headers});
      PlatformClient.call = () => Promise.resolve(response);

      const req = await buildResultPreviewRequest(state, {uniqueId: '1'});
      const res = await client.html(req);

      expect(res.success).toBe('hello');
    });
  });
});
