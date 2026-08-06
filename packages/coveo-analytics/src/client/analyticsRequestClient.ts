import {AnyEventResponse, EventType, IRequestPayload} from '../events';

export interface VisitorIdProvider {
  getCurrentVisitorId: () => Promise<string>;
  setCurrentVisitorId: (visitorId: string) => void;
}

export interface AnalyticsRequestClient {
  sendEvent(eventType: string, payload: IRequestPayload): Promise<AnyEventResponse | void>;
  deleteHttpCookieVisitorId: () => Promise<void>;
}

export interface IAnalyticsClientOptions {
  baseUrl: string;
  token?: string;
  visitorIdProvider: VisitorIdProvider;
  preprocessRequest?: PreprocessAnalyticsRequest;
}

/**
 * The client that issues the request being preprocessed.
 *
 * `analyticsBeacon` identifies events that must survive a page unload, such as click events.
 * Those events are sent with `fetch` and `keepalive: true` rather than the Beacon API, so
 * they now support header mutations. The value itself is deprecated and will be merged into
 * `analyticsFetch` in a future major version.
 */
export type AnalyticsClientOrigin = 'analyticsFetch' | 'analyticsBeacon';

export type PreprocessAnalyticsRequest = (
  request: IAnalyticsRequestOptions,
  clientOrigin: AnalyticsClientOrigin
) => IAnalyticsRequestOptions | Promise<IAnalyticsRequestOptions>;

export interface IAnalyticsRequestOptions extends RequestInit {
  url: string;
}

export class NoopAnalyticsClient implements AnalyticsRequestClient {
  public async sendEvent(_: EventType, __: IRequestPayload): Promise<void> {
    return Promise.resolve();
  }

  public async deleteHttpCookieVisitorId() {
    return Promise.resolve();
  }
}
