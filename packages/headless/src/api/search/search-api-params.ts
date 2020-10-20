import {SearchAppState} from '../../state/search-app-state';
import {HttpMethods, HTTPContentTypes} from '../platform-client';

/**
 * The unique identifier of the target Coveo Cloud organization.
 */
export const getOrganizationIdQueryParam = (state: SearchAppState) =>
  `organizationId=${state.configuration.organizationId}`;

export const getQParam = (state: SearchAppState) => ({
  /**
   * The basic query expression filter applied to the state.
   */
  q: state.query.q,
});

const getAccessToken = (state: SearchAppState) =>
  state.configuration.accessToken;
const getSearchApiBaseUrl = (state: SearchAppState) =>
  state.configuration.search.apiBaseUrl;

export const baseSearchParams = (
  state: SearchAppState,
  method: HttpMethods,
  contentType: HTTPContentTypes,
  path: string
) => ({
  accessToken: getAccessToken(state),
  method,
  contentType,
  url: `${getSearchApiBaseUrl(state)}${path}?${getOrganizationIdQueryParam(
    state
  )}`,
});
