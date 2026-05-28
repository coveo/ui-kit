import {
  type DefaultBodyType,
  type HttpHandler,
  HttpResponse,
  type HttpResponseInit,
  http,
} from 'msw';

export abstract class MockApi {
  abstract get handlers(): HttpHandler[];

  /**
   * Clears all endpoint harnesses, removing any queued responses.
   * This resets endpoints to their base response state without modifying the base response itself.
   */
  abstract clearAll(): void;
}

export type RequestTransformer<TResponse> = (
  body: unknown,
  response: TResponse
) => TResponse;

/**
 * Wraps a transformer so it skips API error responses (objects with `statusCode`).
 * This prevents transformers from corrupting error response shapes.
 */
export function skipOnError<TResponse>(
  transformer: RequestTransformer<TResponse>
): RequestTransformer<TResponse> {
  return (body, response) => {
    if (
      typeof response === 'object' &&
      response !== null &&
      'statusCode' in response
    ) {
      return response;
    }
    return transformer(body, response);
  };
}

type HttpMethod = 'GET' | 'POST';
export class EndpointHarness<TResponse extends {}> {
  private nextResponses: ('error' | ((response: TResponse) => TResponse))[] =
    [];
  private nextResponseInit: HttpResponseInit[] = [];
  private baseResponse: Readonly<TResponse>;
  private initialBaseResponse: Readonly<TResponse>;
  private requestTransformer?: RequestTransformer<TResponse>;
  constructor(
    private method: HttpMethod,
    private path: string,
    initialBaseResponse: TResponse,
    private mswHttpResponseFactory: (
      response: TResponse,
      httpResponseInit?: HttpResponseInit
    ) => HttpResponse<DefaultBodyType> = HttpResponse.json
  ) {
    this.initialBaseResponse = initialBaseResponse;
    this.baseResponse = initialBaseResponse;
  }

  /**
   * Sets a request transformer that modifies the response based on the request body.
   * Unlike `mock()` which statically modifies the base response, this enables
   * dynamic responses that react to request content (e.g., facet selections, pagination).
   */
  withRequestTransformer(transformer: RequestTransformer<TResponse>) {
    this.requestTransformer = transformer;
    return this;
  }

  mock(modifier: (base: TResponse) => TResponse) {
    this.baseResponse = modifier(this.baseResponse);
  }

  reset() {
    this.mock(() => this.initialBaseResponse);
  }

  mockErrorOnce() {
    this.nextResponses.push('error');
    this.nextResponseInit.push({});
  }

  mockOnce(
    responseMiddleware: (response: TResponse) => TResponse,
    httpResponseInit: HttpResponseInit = {}
  ) {
    this.nextResponses.push(responseMiddleware);
    this.nextResponseInit.push(httpResponseInit);
  }

  clear() {
    this.nextResponses.length = 0;
    this.nextResponseInit.length = 0;
  }

  private resolveResponse(): {
    response: TResponse | 'error';
    responseInit?: HttpResponseInit;
  } {
    if (this.nextResponses.length === 0) {
      return {response: this.baseResponse};
    }
    const response = this.nextResponses.shift()!;
    const responseInit = this.nextResponseInit.shift();
    if (response === 'error') {
      return {response: 'error', responseInit};
    }
    return {response: response(this.baseResponse), responseInit};
  }

  generateHandler() {
    return http[this.method.toLowerCase() as Lowercase<HttpMethod>](
      this.path,
      async ({request}) => {
        const {response, responseInit} = this.resolveResponse();
        if (response === 'error') {
          return HttpResponse.error();
        }

        let finalResponse = response;
        if (this.requestTransformer) {
          const body = await request.json().catch(() => ({}));
          finalResponse = this.requestTransformer(body, finalResponse);
        }

        return this.mswHttpResponseFactory(finalResponse, responseInit);
      }
    );
  }
}
