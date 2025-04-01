import {pino} from 'pino';
import {PlatformClient} from '../../platform-client.js';
import {NoopPreprocessRequest} from '../../preprocess-request.js';
import {InsightAPIClient} from './insight-api-client.js';

describe('insight api client', () => {
  const configuration = {
    accessToken: 'some token',
    organizationId: 'some organization id',
    url: 'https://some.platform.com',
  };
  const insightRequest = {
    ...configuration,
    insightId: 'some insight id',
  };
  const exampleUserId = 'John Doe';

  let client: InsightAPIClient;

  const setupCallMock = (success: boolean, response: unknown) => {
    return vi.spyOn(PlatformClient, 'call').mockResolvedValue({
      ok: success,
      json: () => Promise.resolve(response),
    } as unknown as Response);
  };

  beforeEach(() => {
    client = new InsightAPIClient({
      preprocessRequest: NoopPreprocessRequest,
      logger: pino({level: 'silent'}),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getInterface', () => {
    it('should call the platform endpoint with the correct arguments', async () => {
      const callSpy = setupCallMock(true, 'some content');

      await client.getInterface(insightRequest);

      expect(callSpy).toHaveBeenCalled();
      const mockRequest = callSpy.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        accessToken: insightRequest.accessToken,
        method: 'GET',
        contentType: 'application/json',
        url: `${insightRequest.url}/rest/organizations/${insightRequest.organizationId}/insight/v1/configs/${insightRequest.insightId}/interface`,
        origin: 'insightApiFetch',
      });
    });

    it('should return success response on success', async () => {
      setupCallMock(true, 'some content');

      const response = await client.getInterface(insightRequest);

      expect(response).toMatchObject({success: 'some content'});
    });

    it('should return error response on failure', async () => {
      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      setupCallMock(false, expectedError);

      const response = await client.getInterface(insightRequest);

      expect(response).toMatchObject({error: expectedError});
    });
  });

  describe('query', () => {
    const queryRequest = {
      ...insightRequest,
      caseContext: {
        subject: 'some subject',
        description: 'some description',
      },
      q: 'some agent query',
      cq: 'some expression',
      facets: [],
      tab: 'selected tab',
      context: {somekey: 'somevalue'},
    };

    it('should call the platform endpoint with the correct arguments', async () => {
      const callSpy = setupCallMock(true, 'some content');

      await client.query(queryRequest);

      expect(callSpy).toHaveBeenCalled();
      const mockRequest = callSpy.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        accessToken: insightRequest.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${queryRequest.url}/rest/organizations/${queryRequest.organizationId}/insight/v1/configs/${queryRequest.insightId}/search`,
        origin: 'insightApiFetch',
        requestParams: {
          caseContext: queryRequest.caseContext,
          facets: queryRequest.facets,
          q: queryRequest.q,
          cq: queryRequest.cq,
          tab: queryRequest.tab,
          context: queryRequest.context,
        },
      });
    });

    it('should return success response on success', async () => {
      setupCallMock(true, 'some content');

      const response = await client.query(queryRequest);

      expect(response).toMatchObject({success: 'some content'});
    });

    it('should return error response on failure', async () => {
      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      setupCallMock(false, expectedError);

      const response = await client.query(queryRequest);

      expect(response).toMatchObject({error: expectedError});
    });
  });

  describe('querySuggest', () => {
    const querySuggestRequest = {
      ...insightRequest,
      caseContext: {
        subject: 'some subject',
        description: 'some description',
      },
      q: 'some agent query',
      timezone: 'UTC',
      count: 5,
    };

    it('should call the platform endpoint with the correct arguments', async () => {
      const callSpy = setupCallMock(true, {completions: []});

      await client.querySuggest(querySuggestRequest);

      expect(callSpy).toHaveBeenCalled();
      const mockRequest = callSpy.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        accessToken: insightRequest.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${querySuggestRequest.url}/rest/organizations/${querySuggestRequest.organizationId}/insight/v1/configs/${querySuggestRequest.insightId}/querysuggest`,
        requestParams: {
          caseContext: querySuggestRequest.caseContext,
          q: querySuggestRequest.q,
          timezone: querySuggestRequest.timezone,
          count: querySuggestRequest.count,
        },
      });
    });

    it('should return success response on success', async () => {
      setupCallMock(true, {
        completions: [],
      });

      const response = await client.querySuggest(querySuggestRequest);

      expect(response).toMatchObject({success: {completions: []}});
    });

    it('should return error response on failure', async () => {
      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      setupCallMock(false, expectedError);

      const response = await client.querySuggest(querySuggestRequest);

      expect(response).toMatchObject({error: expectedError});
    });
  });

  describe('userActions', () => {
    const userActionsRequest = {
      ...configuration,
      userId: exampleUserId,
    };

    it('should call the platform endpoint with the correct arguments', async () => {
      const callSpy = setupCallMock(true, 'some content');

      await client.userActions(userActionsRequest);

      expect(callSpy).toHaveBeenCalled();
      const request = callSpy.mock.calls[0][0];
      expect(request).toMatchObject({
        accessToken: userActionsRequest.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${userActionsRequest.url}/rest/organizations/${userActionsRequest.organizationId}/machinelearning/user/actions`,
        origin: 'insightApiFetch',
        requestParams: {
          objectId: userActionsRequest.userId,
        },
      });
    });

    it('should return success response on success', async () => {
      setupCallMock(true, 'some content');

      const response = await client.userActions(userActionsRequest);

      expect(response).toMatchObject({success: 'some content'});
    });

    it('should return error response on failure', async () => {
      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      setupCallMock(false, expectedError);

      const response = await client.userActions(userActionsRequest);

      expect(response).toMatchObject({error: expectedError});
    });
  });
});
