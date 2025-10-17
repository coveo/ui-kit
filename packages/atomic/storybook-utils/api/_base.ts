import {type HttpHandler, HttpResponse, http} from 'msw';
import type {ValidateFunction} from 'ajv';
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
    private schemaValidator?: ValidateFunction<unknown>
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
    const responseCandidate =
      this.nextResponses.shift()?.(this.baseResponse) ?? this.baseResponse;
    this.validateResponse(responseCandidate);
    return HttpResponse.json(responseCandidate);
  }

  validateResponse<TResponse extends {}>(
    responseCandidate: TResponse
  ): true | never {
    if(!this.schemaValidator) {
      console.warn(`No schema validator provided for endpoint [${this.method} ${this.path}]. Skipping validation.`);
      return true;
    }
    const isValid = this.schemaValidator(responseCandidate);
    if (!isValid) {
      console.error('Response validation errors:', this.schemaValidator.errors);
      throw new Error(
        `The response does not conform to the expected schema for endpoint [${this.method} ${this.path}].`
      );
    }
    return isValid;
  }

  generateHandler() {
    return http[this.method.toLowerCase() as Lowercase<HttpMethod>]<TResponse>(
      this.path,
      () => this.getNextResponse()
    );
  }
}
