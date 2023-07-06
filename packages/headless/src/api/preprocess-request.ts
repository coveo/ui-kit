import {AnalyticsClientOrigin} from 'coveo.analytics/dist/definitions/client/analyticsRequestClient';
import {SearchApiMethod, SearchOrigin} from './search/search-metadata';

export interface PlatformRequestOptions extends RequestInit {
  url: string;
}

export type PlatformClientOrigin =
  | AnalyticsClientOrigin
  | 'searchApiFetch'
  | 'insightApiFetch'
  | 'caseAssistApiFetch'
  | 'commerceApiFetch';

export interface RequestMetadata {
  /**
   * Method called on the client.
   */
  method: SearchApiMethod;
  /**
   * Origin of the client, helps differentiate in between features using the same method.
   */
  origin?: SearchOrigin;
}

export type PreprocessRequest = (
  /**
   * The HTTP request sent to the Platform.
   */
  request: PlatformRequestOptions,
  /**
   * Origin of the request.
   */
  clientOrigin: PlatformClientOrigin,
  /**
   * Optional metadata provided for the request.
   */
  metadata?: RequestMetadata
) => PlatformRequestOptions | Promise<PlatformRequestOptions>;

export const NoopPreprocessRequest: PreprocessRequest = (request) => request;
