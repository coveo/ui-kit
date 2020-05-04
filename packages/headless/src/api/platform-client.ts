import fetch from 'cross-fetch';

export interface PlatformClientCallOptions<RequestParams> {
  url: string;
  accessToken: string;
  method: 'POST';
  contentType: 'application/json';
  requestParams: RequestParams;
}

export class PlatformClient {
  static async call<RequestParams, ResponseType>(
    options: PlatformClientCallOptions<RequestParams>
  ) {
    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        'Content-Type': options.contentType,
        Authorization: `Bearer ${options.accessToken}`,
      },
      body: JSON.stringify(options.requestParams),
    });

    if (response.ok) {
      return (await response.json()) as ResponseType;
    }

    throw `Request Error (status: ${response.status} ${response.statusText})`;
  }
}
