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
