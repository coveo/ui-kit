import {SearchPageState} from '../../state';
import {HttpMethods, HTTPContentTypes} from '../platform-client';

export const getOrganizationIdParam = (state: SearchPageState) => ({
  /**
   * The unique identifier of the target Coveo Cloud organization.
   */
  organizationId: state.configuration.organizationId,
});

export const getQParam = (state: SearchPageState) => ({
  /**
   * The basic query expression filter applied to the state.
   */
  q: state.query.q,
});

const getAccessToken = (state: SearchPageState) =>
  state.configuration.accessToken;
const getSearchApiBaseUrl = (state: SearchPageState) =>
  state.configuration.search.searchApiBaseUrl;

export const baseSearchParams = (
  state: SearchPageState,
  method: HttpMethods,
  contentType: HTTPContentTypes,
  path: string
) => ({
  accessToken: getAccessToken(state),
  method,
  contentType,
  url: `${getSearchApiBaseUrl(state)}${path}`,
});
