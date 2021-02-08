import {AnalyticsClientOrigin} from 'coveo.analytics/dist/definitions/client/analyticsRequestClient';

export interface PlatformRequestOptions extends RequestInit {
  url: string;
}

export type PlatformClientOrigin = AnalyticsClientOrigin | 'searchApiFetch';

export type PreprocessRequest = (
  request: PlatformRequestOptions,
  clientOrigin: PlatformClientOrigin
) => PlatformRequestOptions | Promise<PlatformRequestOptions>;

export const NoopPreprocessRequest: PreprocessRequest = (request) => request;
