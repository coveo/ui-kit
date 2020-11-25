import {
  platformUrl,
  PlatformClient,
  PreprocessRequestMiddleware,
} from './platform-client';
import * as BackOff from 'exponential-backoff';

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
    return PlatformClient.call(
      {
        accessToken: 'accessToken1',
        contentType: 'application/json',
        method: 'POST',
        requestParams: {
          test: 123,
        },
        url: platformUrl(),
        renewAccessToken: async () => 'accessToken2',
      },
      middleware
    );
  }

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should call fetch with the right parameters', async (done) => {
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

    done();
  });

  it(`when status is 419
  should renewToken and retry call with new token`, async (done) => {
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

    done();
  });

  it('when status is 429 should try exponential backOff', async (done) => {
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
    done();
  });

  it('should not throw and return a response when backOff returns a rejected promise', async (done) => {
    const spy = jest.spyOn(BackOff, 'backOff');
    const mockResponse = new Response(JSON.stringify({}), {status: 429});
    spy.mockRejectedValue(mockResponse);
    const response = await platformCall();
    expect(spy).not.toThrow();
    expect(response.response).toBe(mockResponse);
    done();
  });

  it('should preprocess the request if a middleware is provided', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({})))
    );

    await platformCall((request) => {
      return {
        ...request,
        customHeaders: {
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
});
