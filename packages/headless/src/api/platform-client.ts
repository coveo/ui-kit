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

type PlatformCombination =
  | {env: 'dev'; region: 'us-east-1' | 'eu-west-1' | 'eu-west-3'}
  | {env: 'qa'; region: 'us-east-1' | 'eu-west-1' | 'ap-southeast-2'}
  | {env: 'hipaa'; region: 'us-east-1'}
  | {env: 'prod'; region: 'us-east-1' | 'us-west-2' | 'eu-west-1'};

type PlatformEnvironment = PlatformCombination['env'];

export function platformUrl<E extends PlatformEnvironment = 'prod'>(options?: {
  environment?: E;
  region?: Extract<PlatformCombination, {env: E}>['region'];
}) {
  const urlEnv =
    !options || !options.environment || options.environment === 'prod'
      ? ''
      : options.environment;
  const urlRegion =
    !options || !options.region || options.region === 'us-east-1'
      ? ''
      : `-${options.region}`;

  return `https://platform${urlEnv}${urlRegion}.cloud.coveo.com`;
}
