import {HeadlessState} from '../../state';
import {HttpMethods, HTTPContentTypes} from '../platform-client';

export const getOrganizationIdParam = (state: HeadlessState) => ({
  /**
   * The unique identifier of the target Coveo Cloud organization.
   */
  organizationId: state.configuration.organizationId,
});

export const getQParam = (state: HeadlessState) => ({
  /**
   * The basic query expression filter applied to the state.
   */
  q: state.query.q,
});

export const getSortCriteriaParam = (state: HeadlessState) => ({
  /**
   * The search query sort criteria.
   */
  sortCriteria: state.sortCriteria,
});

const getAccessToken = (state: HeadlessState) =>
  state.configuration.accessToken;
const getSearchApiBaseUrl = (state: HeadlessState) =>
  state.configuration.search.searchApiBaseUrl;

export const baseSearchParams = (
  state: HeadlessState,
  method: HttpMethods,
  contentType: HTTPContentTypes,
  path: string
) => ({
  accessToken: getAccessToken(state),
  method,
  contentType,
  url: `${getSearchApiBaseUrl(state)}${path}`,
});
