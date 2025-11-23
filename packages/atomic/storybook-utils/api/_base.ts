import {
  type DefaultBodyType,
  type HttpHandler,
  HttpResponse,
  type HttpResponseInit,
  http,
  type StrictRequest,
} from 'msw';

export abstract class MockApi {
  abstract get handlers(): HttpHandler[];
}

/**
 * Captured request information including URL, headers, body, and timing.
 */
export interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  timestamp: number;
}

type HttpMethod = 'GET' | 'POST';
export class EndpointHarness<TResponse extends {}> {
  private nextResponses: ('error' | ((response: TResponse) => TResponse))[] =
    [];
  private nextResponseInit: HttpResponseInit[] = [];
  private baseResponse: Readonly<TResponse>;
  private initialBaseResponse: Readonly<TResponse>;
  private capturedRequests: CapturedRequest[] = [];
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

  /**
   * Clear all captured requests.
   * Call this in beforeEach to ensure a clean slate for each test.
   */
  clearCapturedRequests() {
    this.capturedRequests.length = 0;
  }

  /**
   * Get all captured requests made to this endpoint.
   * Returns a copy to prevent external mutation.
   */
  getCapturedRequests(): CapturedRequest[] {
    return [...this.capturedRequests];
  }

  /**
   * Get the most recent captured request, or undefined if none exist.
   */
  getLastCapturedRequest(): CapturedRequest | undefined {
    return this.capturedRequests[this.capturedRequests.length - 1];
  }

  /**
   * Get the count of captured requests.
   */
  getCapturedRequestCount(): number {
    return this.capturedRequests.length;
  }

  /**
   * Wait for a request to be captured.
   * Returns a promise that resolves when the next request is captured.
   * Useful for async assertions in Playwright tests.
   *
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   * @returns Promise that resolves with the captured request
   */
  async waitForNextRequest(timeout = 5000): Promise<CapturedRequest> {
    const startCount = this.capturedRequests.length;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.capturedRequests.length > startCount) {
          clearInterval(checkInterval);
          resolve(this.capturedRequests[this.capturedRequests.length - 1]);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(
            new Error(
              `Timeout waiting for request to ${this.path} after ${timeout}ms`
            )
          );
        }
      }, 50);
    });
  }

  private async captureRequest(request: StrictRequest<DefaultBodyType>) {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let body: unknown = null;
    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await request.clone().json();
      } else {
        body = await request.clone().text();
      }
    } catch {
      // If body parsing fails, leave it as null
    }

    this.capturedRequests.push({
      url: request.url,
      method: request.method,
      headers,
      body,
      timestamp: Date.now(),
    });
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
      async ({request}) => {
        await this.captureRequest(request);
        return this.getNextResponse();
      }
    );
  }
}
