import {
  type DefaultBodyType,
  type HttpHandler,
  HttpResponse,
  type HttpResponseInit,
  http,
} from 'msw';

export abstract class MockApi {
  abstract get handlers(): HttpHandler[];
}

type HttpMethod = 'GET' | 'POST';
export class EndpointHarness<TResponse extends {}> {
  private nextResponses: ('error' | ((response: TResponse) => TResponse))[] =
    [];
  private nextResponseInit: HttpResponseInit[] = [];
  private baseResponse: Readonly<TResponse>;
  private initialBaseResponse: Readonly<TResponse>;
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
  }

  getNextResponse(): HttpResponse<DefaultBodyType> {
    if (this.nextResponses.length === 0) {
      return this.mswHttpResponseFactory(this.baseResponse);
    } else {
      const response = this.nextResponses.shift()!;
      const responseInit = this.nextResponseInit.shift();
      if (response === 'error') {
        return HttpResponse.error();
      } else {
        return this.mswHttpResponseFactory(
          response!(this.baseResponse),
          responseInit
        );
      }
    }
  }

  generateHandler() {
    return http[this.method.toLowerCase() as Lowercase<HttpMethod>]<TResponse>(
      this.path,
      () => this.getNextResponse()
    );
  }
}
