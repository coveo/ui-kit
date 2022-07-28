import {AnalyticsClientOrigin} from 'coveo.analytics/dist/definitions/client/analyticsRequestClient';
import {SearchApiClientMethod, SearchOrigin} from './search/search-metadata';

export interface PlatformRequestOptions extends RequestInit {
  url: string;
}

export type PlatformClientOrigin = AnalyticsClientOrigin | 'searchApiFetch';

export interface RequestMetadata {
  clientMethod: SearchApiClientMethod;
  origin?: SearchOrigin;
}

export type PreprocessRequest = (
  request: PlatformRequestOptions,
  clientOrigin: PlatformClientOrigin,
  metadata?: RequestMetadata
) => PlatformRequestOptions | Promise<PlatformRequestOptions>;

export const NoopPreprocessRequest: PreprocessRequest = (request) => request;
