import * as BackOff from 'exponential-backoff';
import {pino} from 'pino';
import type {Mock} from 'vitest';
import {UnauthorizedTokenError} from '../utils/errors.js';
import type {PlatformEnvironment} from '../utils/url-utils.js';
import {
  getAnalyticsNextApiBaseUrl,
  getOrganizationEndpoint,
  getSearchApiBaseUrl,
  PlatformClient,
  type PlatformClientCallOptions,
} from './platform-client.js';
import {
  NoopPreprocessRequest,
  type PlatformRequestOptions,
  type PreprocessRequest,
} from './preprocess-request.js';

const {Response} = await vi.importActual('node-fetch');
global.fetch = vi.fn();
const mockFetch = global.fetch as Mock;

it.each([
  {
    orgId: 'foo',
    env: undefined,
    organizationEndpoints: {
      admin: 'https://foo.admin.org.coveo.com',
      analytics: 'https://foo.analytics.org.coveo.com',
      analyticsNext:
        'https://foo.analytics.org.coveo.com/rest/organizations/foo/events/v1',
      platform: 'https://foo.org.coveo.com',
      search: 'https://foo.org.coveo.com/rest/search/v2',
    },
  },
  {
    orgId: 'foo',
    env: 'dev',
    organizationEndpoints: {
      admin: 'https://foo.admin.orgdev.coveo.com',
      analytics: 'https://foo.analytics.orgdev.coveo.com',
      analyticsNext:
        'https://foo.analytics.orgdev.coveo.com/rest/organizations/foo/events/v1',
      platform: 'https://foo.orgdev.coveo.com',
      search: 'https://foo.orgdev.coveo.com/rest/search/v2',
    },
  },
  {
    orgId: 'foo',
    env: 'stg',
    organizationEndpoints: {
      admin: 'https://foo.admin.orgstg.coveo.com',
      analytics: 'https://foo.analytics.orgstg.coveo.com',
      analyticsNext:
        'https://foo.analytics.orgstg.coveo.com/rest/organizations/foo/events/v1',
      platform: 'https://foo.orgstg.coveo.com',
      search: 'https://foo.orgstg.coveo.com/rest/search/v2',
    },
  },
  {
    orgId: 'foo',
    env: 'prod',
    organizationEndpoints: {
      admin: 'https://foo.admin.org.coveo.com',
      analytics: 'https://foo.analytics.org.coveo.com',
      analyticsNext:
        'https://foo.analytics.org.coveo.com/rest/organizations/foo/events/v1',
      platform: 'https://foo.org.coveo.com',
      search: 'https://foo.org.coveo.com/rest/search/v2',
    },
  },
  {
    orgId: 'foo',
    env: 'hipaa',
    organizationEndpoints: {
      admin: 'https://foo.admin.orghipaa.coveo.com',
      analytics: 'https://foo.analytics.orghipaa.coveo.com',
      analyticsNext:
        'https://foo.analytics.orghipaa.coveo.com/rest/organizations/foo/events/v1',
      platform: 'https://foo.orghipaa.coveo.com',
      search: 'https://foo.orghipaa.coveo.com/rest/search/v2',
    },
  },
] as Array<{
  orgId: string;
  env: PlatformEnvironment;
  organizationEndpoints: {
    admin: string;
    analytics: string;
    analyticsNext: string;
    platform: string;
    search: string;
  };
}>)(
  'return the correct #getOrganizationEndpoints()',
  ({orgId, env, organizationEndpoints}) => {
    expect(getOrganizationEndpoint(orgId, env, 'admin')).toEqual(
      organizationEndpoints.admin
    );
    expect(getOrganizationEndpoint(orgId, env, 'analytics')).toEqual(
      organizationEndpoints.analytics
    );
    expect(getAnalyticsNextApiBaseUrl(orgId, env)).toEqual(
      organizationEndpoints.analyticsNext
    );
    expect(getOrganizationEndpoint(orgId, env, 'platform')).toEqual(
      organizationEndpoints.platform
    );
    expect(getOrganizationEndpoint(orgId, env)).toEqual(
      organizationEndpoints.platform
    );
    expect(getSearchApiBaseUrl(orgId, env)).toEqual(
      organizationEndpoints.search
    );
  }
);

describe('PlatformClient call', () => {
  let url: string;
  function platformCall(options: Partial<PlatformClientCallOptions> = {}) {
    return PlatformClient.call({
      accessToken: 'accessToken1',
      contentType: 'application/json',
      method: 'POST',
      requestParams: {
        test: 123,
      },
      url: getOrganizationEndpoint(''),
      preprocessRequest: NoopPreprocessRequest,
      logger: pino({level: 'silent'}),
      origin: 'searchApiFetch',
      ...options,
    });
  }

  beforeEach(() => {
    url = getOrganizationEndpoint('');
    mockFetch.mockClear();
  });

  it('should call fetch with the right parameters', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({})))
    );

    await platformCall();

    expect(mockFetch).toHaveBeenCalledWith(url, {
      body: JSON.stringify({
        test: 123,
      }),
      headers: {
        Authorization: 'Bearer accessToken1',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });

  it('should preprocess the request if a middleware is provided', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({})))
    );
    const middleware = (request: PlatformRequestOptions) => {
      return {
        ...request,
        headers: {
          ...request.headers,
          test: 'header',
        },
      };
    };
    await platformCall({preprocessRequest: middleware});

    expect(mockFetch).toHaveBeenCalledWith(url, {
      body: JSON.stringify({
        test: 123,
      }),
      headers: {
        Authorization: 'Bearer accessToken1',
        'Content-Type': 'application/json',
        test: 'header',
      },
      method: 'POST',
    });
  });

  it('should recover if the preprocessRequest throws and should use an untainted request', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({})))
    );
    const preprocessRequest: PreprocessRequest = (req) => {
      req.headers = {
        shouldNotExistsOnTheOutgoingRequest: 'foo',
      };
      throw 'boom';
    };
    await platformCall({preprocessRequest});
    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer accessToken1',
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it(`when the contentType is www-url-form-encoded and the #requestParams can be encoded,
  it encodes the body as a url`, async () => {
    await platformCall({
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({body: 'q=hello&page=5'})
    );
  });

  it(`when the contentType is www-url-form-encoded and the #requestParams cannot be encoded,
  it sends an empty string`, async () => {
    await platformCall({
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: {}},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({body: ''})
    );
  });

  it('when the contentType is unrecognized, it encodes the request params as JSON', async () => {
    const requestParams = {q: 'a'};
    await platformCall({contentType: undefined, requestParams});

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({body: JSON.stringify(requestParams)})
    );
  });

  it('when the method is POST, #body should be present', async () => {
    await platformCall({
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({body: 'q=hello&page=5'})
    );
  });

  it('when the method is PUT, #body is used for body', async () => {
    await platformCall({
      method: 'PUT',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({body: 'q=hello&page=5'})
    );
  });

  it('when the method is GET, #body should be absent', async () => {
    await platformCall({
      method: 'GET',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.not.objectContaining({body: expect.anything()})
    );
  });

  it('when the method is DELETE, #body should be absent', async () => {
    await platformCall({
      method: 'DELETE',
      contentType: 'application/x-www-form-urlencoded',
      requestParams: {q: 'hello', page: 5},
    });

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.not.objectContaining({body: expect.anything()})
    );
  });

  it.each([401, 419])(
    'when status is %d should return a TokenExpiredError',
    async (status) => {
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status}))
      );

      const response = await platformCall();
      expect(response).toBeInstanceOf(UnauthorizedTokenError);
    }
  );

  it('when status is 429 should try exponential backOff', async () => {
    mockFetch
      .mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 429}))
      )
      .mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 429}))
      )
      .mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

    await platformCall();

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should not throw when backOff rejects with a response', async () => {
    const spy = vi.spyOn(BackOff, 'backOff');
    const expectedResponse = new Response(
      JSON.stringify({someProps: 'someValue'}),
      {
        status: 429,
      }
    );
    spy.mockRejectedValueOnce(expectedResponse);

    const response = await platformCall();
    expect(response).toBe(expectedResponse);
  });

  describe('retry configuration for 429 responses', () => {
    it('should use startingDelay of 100ms for exponential component', async () => {
      const backOffSpy = vi.spyOn(BackOff, 'backOff');
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

      await platformCall();

      const options = backOffSpy.mock.calls[0][1];
      expect(options?.startingDelay).toBe(100);
    });

    it('should use timeMultiple of 2 for exponential backoff', async () => {
      const backOffSpy = vi.spyOn(BackOff, 'backOff');
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

      await platformCall();

      const options = backOffSpy.mock.calls[0][1];
      expect(options?.timeMultiple).toBe(2);
    });

    it('should cap maxDelay at 800ms', async () => {
      const backOffSpy = vi.spyOn(BackOff, 'backOff');
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

      await platformCall();

      const options = backOffSpy.mock.calls[0][1];
      expect(options?.maxDelay).toBe(800);
    });

    it('should limit to 4 retry attempts', async () => {
      const backOffSpy = vi.spyOn(BackOff, 'backOff');
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

      await platformCall();

      const options = backOffSpy.mock.calls[0][1];
      expect(options?.numOfAttempts).toBe(4);
    });

    it('should enable full jitter to prevent thundering herd', async () => {
      const backOffSpy = vi.spyOn(BackOff, 'backOff');
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

      await platformCall();

      const options = backOffSpy.mock.calls[0][1];
      expect(options?.jitter).toBe('full');
    });

    it('should wait minimum 1s between retries', async () => {
      const startTime = Date.now();
      mockFetch
        .mockReturnValueOnce(
          Promise.resolve(new Response(JSON.stringify({}), {status: 429}))
        )
        .mockReturnValueOnce(
          Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
        );

      await platformCall();

      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(1000);
    });

    it('should retry on 429', async () => {
      const backOffSpy = vi.spyOn(BackOff, 'backOff');
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

      await platformCall();

      const retryFn = backOffSpy.mock.calls[0][1]?.retry;
      expect(retryFn).toBeDefined();

      const response429 = new Response(JSON.stringify({}), {status: 429});
      const startTime = Date.now();
      expect(await retryFn!(response429, 1)).toBe(true);
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(1000);
    });

    it('should not retry on 500', async () => {
      const backOffSpy = vi.spyOn(BackOff, 'backOff');
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

      await platformCall();

      const retryFn = backOffSpy.mock.calls[0][1]?.retry;
      expect(retryFn).toBeDefined();

      const response500 = new Response(JSON.stringify({}), {status: 500});
      const startTime = Date.now();
      expect(await retryFn!(response500, 1)).toBe(false);
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeLessThan(100);
    });

    it('should not retry on 200', async () => {
      const backOffSpy = vi.spyOn(BackOff, 'backOff');
      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

      await platformCall();

      const retryFn = backOffSpy.mock.calls[0][1]?.retry;
      expect(retryFn).toBeDefined();

      const response200 = new Response(JSON.stringify({}), {status: 200});
      const startTime = Date.now();
      expect(await retryFn!(response200, 1)).toBe(false);
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeLessThan(100);
    });
  });

  it('should not throw when fetch throws a common error', async () => {
    const fetchError = new Error('Could not fetch');
    fetchError.name = 'FetchError';

    mockFetch.mockRejectedValue(fetchError);
    const response = await platformCall();

    expect(response).toBe(fetchError);
  });

  it('should return when there is an AbortError', async () => {
    const abortError = new Error();
    abortError.name = 'AbortError';

    mockFetch.mockRejectedValue(abortError);
    const response = await platformCall();
    expect(response).toBe(abortError);
  });
});
