import {type HttpHandler, HttpResponse, http} from 'msw';

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
    initialBaseResponse: TResponse
  ) {
    this.initialBaseResponse = Object.freeze(initialBaseResponse);
    this.baseResponse = Object.freeze(structuredClone(initialBaseResponse));
  }

  modifyBaseResponse(modifier: (base: TResponse) => TResponse) {
    this.baseResponse = Object.freeze(modifier(this.baseResponse));
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

  getNextResponse(): HttpResponse<TResponse> {
    return HttpResponse.json(
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
