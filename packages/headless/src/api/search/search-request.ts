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

const getAccessToken = (state: HeadlessState) =>
  state.configuration.accessToken;
const getEndpoint = (state: HeadlessState) =>
  state.configuration.search.endpoint;

export const baseSearchParams = (
  state: HeadlessState,
  method: HttpMethods,
  contentType: HTTPContentTypes,
  path: string
) => ({
  accessToken: getAccessToken(state),
  method,
  contentType,
  url: `${getEndpoint(state)}${path}`,
});
