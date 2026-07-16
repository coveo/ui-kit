import * as CrossFetch from 'cross-fetch';

type ResponseFactory = (url: string, options: RequestInit) => unknown;

type Route = {
  method: string;
  matcher: RegExp | string;
  response: unknown | ResponseFactory;
};

function normalizeUrl(url: string) {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}
type FetchCall = [string, RequestInit];

class FetchMock {
  private readonly routes: Route[] = [];
  private readonly recordedCalls: FetchCall[] = [];

  public mock(matcher: RegExp | string, response: unknown) {
    this.routes.push({method: 'ANY', matcher, response});
    return this;
  }

  public post(matcher: RegExp | string, response: ResponseFactory): this;
  public post(matcher: RegExp | string, response: unknown): this;
  public post(matcher: RegExp | string, response: unknown) {
    this.routes.push({method: 'POST', matcher, response});
    return this;
  }

  public put(matcher: RegExp | string, response: unknown) {
    this.routes.push({method: 'PUT', matcher, response});
    return this;
  }

  public reset() {
    this.resetBehavior();
    this.resetHistory();
    return this;
  }

  public resetBehavior() {
    this.routes.length = 0;
    return this;
  }

  public resetHistory() {
    this.recordedCalls.length = 0;
    return this;
  }

  public called() {
    return this.recordedCalls.length > 0;
  }

  public calls() {
    return this.recordedCalls;
  }

  public lastCall() {
    return this.recordedCalls[this.recordedCalls.length - 1];
  }

  public lastUrl() {
    return this.lastCall()?.[0];
  }

  public async fetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const inputUrl = typeof input === 'string' ? input : input.toString();
    const url = normalizeUrl(inputUrl);
    const options = init;
    this.recordedCalls.push([url, options]);

    const method = options.method?.toUpperCase() ?? 'GET';
    const route = this.routes.find(
      ({method: routeMethod, matcher}) =>
        (routeMethod === 'ANY' || routeMethod === method) &&
        (matcher === '*' ||
          (typeof matcher === 'string' ? matcher === url : matcher.test(url)))
    );

    if (!route) {
      throw new Error(`No mock route matched ${method} ${url}`);
    }

    const response =
      typeof route.response === 'function'
        ? route.response(url, options)
        : route.response;
    return new CrossFetch.Response(JSON.stringify(response), {
      headers: {'content-type': 'application/json'},
      status: 200,
    });
  }
}

export function mockFetch() {
  const fetchMock = new FetchMock();
  return {
    fetchMock,
    fetchMockBeforeEach: () =>
      (CrossFetch.fetch as jest.MockedFunction<typeof CrossFetch.fetch>)
        .mockReset()
        .mockImplementation(
          fetchMock.fetch.bind(fetchMock) as typeof CrossFetch.fetch
        ),
  };
}

export function lastCallBody(fetchMock: FetchMock): string {
  const [, options] = fetchMock.lastCall()!;
  return options.body!.toString();
}
