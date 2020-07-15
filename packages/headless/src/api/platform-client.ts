import fetch from 'cross-fetch';

export type HttpMethods = 'POST' | 'GET' | 'DELETE' | 'PUT';
export type HTTPContentTypes = 'application/json' | 'text/html';

export interface PlatformClientCallOptions<RequestParams> {
  url: string;
  accessToken: string;
  method: HttpMethods;
  contentType: HTTPContentTypes;
  requestParams: RequestParams;
}

export interface PlatformResponse<T> {
  body: T;
  response: Response;
}

export class PlatformClient {
  static async call<RequestParams, ResponseType>(
    options: PlatformClientCallOptions<RequestParams>
  ): Promise<PlatformResponse<ResponseType>> {
    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        'Content-Type': options.contentType,
        Authorization: `Bearer ${options.accessToken}`,
      },
      body: JSON.stringify(options.requestParams),
    });

    const body = (await response.json()) as ResponseType;
    return {
      response,
      body,
    };
  }
}
