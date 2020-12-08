import {
  platformUrl,
  PlatformClient,
  PreprocessRequestMiddleware,
  NoopPreprocessRequestMiddleware,
} from './platform-client';
import pino from 'pino';

jest.mock('cross-fetch');
import fetch from 'cross-fetch';
const {Response} = jest.requireActual('node-fetch');
const mockFetch = fetch as jest.Mock;

describe('platformUrl helper', () => {
  it('should return https://platform.cloud.coveo.com by default', () => {
    expect(platformUrl()).toBe('https://platform.cloud.coveo.com');
  });

  it(`when the environment is prod
  should not return it in the url e.g. https://platform.cloud.coveo.com`, () => {
    expect(platformUrl({environment: 'prod'})).toBe(
      'https://platform.cloud.coveo.com'
    );
  });

  it(`when the environment is not prod
  should return it in the url e.g. https://platformdev.cloud.coveo.com`, () => {
    expect(platformUrl({environment: 'dev'})).toBe(
      'https://platformdev.cloud.coveo.com'
    );
  });

  it(`when the region is us-east-1
  should not return it in the url e.g. https://platform.cloud.coveo.com`, () => {
    expect(platformUrl({region: 'us-east-1'})).toBe(
      'https://platform.cloud.coveo.com'
    );
  });

  it(`when the region is not us-east-1
  should return it in the url e.g. https://platform-us-west-2.cloud.coveo.com`, () => {
    expect(platformUrl({region: 'us-west-2'})).toBe(
      'https://platform-us-west-2.cloud.coveo.com'
    );
  });
});

describe('PlatformClient call', () => {
  function platformCall(middleware?: PreprocessRequestMiddleware) {
    return PlatformClient.call({
      accessToken: 'accessToken1',
      contentType: 'application/json',
      method: 'POST',
      requestParams: {
        test: 123,
      },
      url: platformUrl(),
      renewAccessToken: async () => 'accessToken2',
      preprocessRequest: middleware || NoopPreprocessRequestMiddleware,
      logger: pino({level: 'silent'}),
    });
  }

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should call fetch with the right parameters', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({})))
    );

    await platformCall();

    expect(mockFetch).toHaveBeenCalledWith(platformUrl(), {
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

    await platformCall((request) => {
      return {
        ...request,
        headers: {
          test: 'header',
        },
      };
    });

    expect(mockFetch).toHaveBeenCalledWith(platformUrl(), {
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

  it(`when status is 419
  should renewToken and retry call with new token`, async () => {
    mockFetch
      .mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 419}))
      )
      .mockReturnValueOnce(
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );

    await platformCall();

    expect(mockFetch).toHaveBeenNthCalledWith(2, platformUrl(), {
      body: JSON.stringify({
        test: 123,
      }),
      headers: {
        Authorization: 'Bearer accessToken2',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });

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

  it('should throw when fetch throws an error', async () => {
    const error = new Error('Test');
    try {
      mockFetch.mockRejectedValue(error);
      expect(await platformCall()).toThrow();
    } catch (error) {
      expect(error).toEqual(error);
    }
  });
});
