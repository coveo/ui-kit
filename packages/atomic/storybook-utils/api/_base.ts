import {type DefaultBodyType, type HttpHandler, HttpResponse, http} from 'msw';

export abstract class MockApi {
  abstract get handlers(): HttpHandler[];
}

type HttpMethod = 'GET' | 'POST';
export class EndpointHarness<TResponse extends {}> {
  private nextResponses: ((response: TResponse) => TResponse)[] = [];
  private baseResponse: Readonly<TResponse>;
  private initialBaseResponse: Readonly<TResponse>;
  constructor(
    private method: HttpMethod,
    private path: string,
    initialBaseResponse: TResponse,
    private mswHttpResponseFactory: (
      response: TResponse
    ) => HttpResponse<DefaultBodyType> = HttpResponse.json
  ) {
    this.initialBaseResponse = initialBaseResponse;
    this.baseResponse = initialBaseResponse;
  }

  modifyBaseResponse(modifier: (base: TResponse) => TResponse) {
    this.baseResponse = modifier(this.baseResponse);
  }

  resetBaseResponse() {
    this.modifyBaseResponse(() => this.initialBaseResponse);
  }

  enqueueNextResponse(responseMiddleware: (response: TResponse) => TResponse) {
    this.nextResponses.push(responseMiddleware);
  }

  flushQueuedResponses() {
    this.nextResponses.length = 0;
  }

  getNextResponse(): HttpResponse<DefaultBodyType> {
    return this.mswHttpResponseFactory(
      this.nextResponses.shift()?.(this.baseResponse) ?? this.baseResponse
    );
  }

  generateHandler() {
    return http[this.method.toLowerCase() as Lowercase<HttpMethod>]<TResponse>(
      this.path,
      () => this.getNextResponse()
    );
  }
}
