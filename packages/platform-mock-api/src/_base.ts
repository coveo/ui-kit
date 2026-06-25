import {
  type DefaultBodyType,
  type HttpHandler,
  HttpResponse,
  type HttpResponseInit,
  http,
} from 'msw';
import type {RequestTransformer} from './_request-transformer.js';

export abstract class MockApi {
  abstract get handlers(): HttpHandler[];

  /**
   * Clears all endpoint harnesses, removing any queued responses.
   * This resets endpoints to their base response state without modifying the base response itself.
   */
  abstract clearAll(): void;
}

type HttpMethod = 'GET' | 'POST';
export class EndpointHarness<TResponse extends {}> {
  private nextResponses: ('error' | ((response: TResponse) => TResponse))[] =
    [];
  private nextResponseInit: HttpResponseInit[] = [];
  private baseResponse: Readonly<TResponse>;
  private initialBaseResponse: Readonly<TResponse>;
  private requestTransformers: RequestTransformer<TResponse>[] = [];
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
   * Adds a request transformer that modifies the response based on the request body.
   * Unlike `mock()` which statically modifies the base response, this enables
   * dynamic responses that react to request content (e.g., facet selections, pagination).
   * Multiple transformers are applied in the order they are added.
   */
  addRequestTransformer<TInput extends TResponse = TResponse>(
    ...transformers: RequestTransformer<TInput>[]
  ) {
    for (const transformer of transformers) {
      this.requestTransformers.push(
        transformer as unknown as RequestTransformer<TResponse>
      );
    }
    return this;
  }

  /**
   * Removes a previously added request transformer by reference.
   * Useful when a specific story doesn't need a transformer that was
   * registered at module scope for other stories in the same file.
   */
  removeRequestTransformer<TInput extends TResponse = TResponse>(
    ...transformers: RequestTransformer<TInput>[]
  ) {
    for (const transformer of transformers) {
      const index = this.requestTransformers.indexOf(
        transformer as unknown as RequestTransformer<TResponse>
      );
      if (index !== -1) {
        this.requestTransformers.splice(index, 1);
      }
    }
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
        if (this.requestTransformers.length > 0) {
          const body = await request.json().catch(() => ({}));
          for (const transformer of this.requestTransformers) {
            finalResponse = transformer(body, finalResponse);
          }
        }

        return this.mswHttpResponseFactory(finalResponse, responseInit);
      }
    );
  }
}
