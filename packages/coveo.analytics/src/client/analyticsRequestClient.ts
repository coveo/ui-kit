import {AnyEventResponse, IRequestPayload} from '../events';

export interface VisitorIdProvider {
    getCurrentVisitorId: () => Promise<string>;
    setCurrentVisitorId: (visitorId: string) => void;
}

export interface AnalyticsRequestClient {
    sendEvent(eventType: string, payload: IRequestPayload): Promise<AnyEventResponse | void>;
}

export type AnalyticsClientOrigin = 'analyticsFetch' | 'analyticsBeacon';

export type PreprocessRequest = (
    request: IAnalyticsRequestOptions,
    clientOrigin: AnalyticsClientOrigin
) => IAnalyticsRequestOptions | Promise<IAnalyticsRequestOptions>;

export interface IAnalyticsRequestOptions extends RequestInit {
    url: string;
}
