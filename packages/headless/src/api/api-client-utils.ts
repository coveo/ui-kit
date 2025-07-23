import type {PlatformResponse} from './platform-client.js';
import type {BaseParam} from './platform-service-params.js';
import type {AllSearchAPIResponse} from './search/search-api-client.js';
import type {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from './search/search-api-error-response.js';
import type {AuthenticationParam} from './search/search-api-params.js';

export function pickNonBaseParams<
  Params extends BaseParam & AuthenticationParam,
>(req: Params) {
  const {
    url: _url,
    accessToken: _accessToken,
    organizationId: _organizationId,
    authentication: _authentication,
    ...nonBase
  } = req;
  return nonBase;
}

export const unwrapError = (
  payload: PlatformResponse<AllSearchAPIResponse>
): SearchAPIErrorWithStatusCode => {
  const {response} = payload;

  if (response.body) {
    return unwrapSearchApiError(payload);
  }

  return unwrapClientError(response);
};

const unwrapSearchApiError = (
  payload: PlatformResponse<AllSearchAPIResponse>
) => {
  if (isSearchAPIException(payload)) {
    return unwrapErrorByException(payload);
  }

  if (isSearchAPIErrorWithStatusCode(payload)) {
    return payload.body;
  }

  return {message: 'unknown', statusCode: 0, type: 'unknown'};
};

const unwrapClientError = (response: Response) => {
  // Transform an error to an object https://stackoverflow.com/a/26199752
  const body = JSON.parse(
    JSON.stringify(response, Object.getOwnPropertyNames(response))
  ) as Error;

  return {
    ...body,
    message: `Client side error: ${body.message || ''}`,
    statusCode: 400,
    type: 'ClientError',
  };
};

function isSearchAPIErrorWithStatusCode(
  r: PlatformResponse<AllSearchAPIResponse>
): r is PlatformResponse<SearchAPIErrorWithStatusCode> {
  return (
    (r as PlatformResponse<SearchAPIErrorWithStatusCode>).body.statusCode !==
    undefined
  );
}

function isSearchAPIException(
  r: PlatformResponse<AllSearchAPIResponse>
): r is PlatformResponse<SearchAPIErrorWithExceptionInBody> {
  return (
    (r as PlatformResponse<SearchAPIErrorWithExceptionInBody>).body
      .exception !== undefined
  );
}

const unwrapErrorByException = (
  res: PlatformResponse<SearchAPIErrorWithExceptionInBody>
): SearchAPIErrorWithStatusCode => ({
  message: res.body.exception.code,
  statusCode: res.response.status,
  type: res.body.exception.code,
});
