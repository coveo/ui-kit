import {AnalyticsRequestClient, IAnalyticsRequestOptions, IAnalyticsClientOptions} from './analyticsRequestClient';
import {EventType, IRequestPayload} from '../events';

export class AnalyticsBeaconClient implements AnalyticsRequestClient {
    constructor(private opts: IAnalyticsClientOptions) {}

    public async sendEvent(eventType: EventType, payload: IRequestPayload): Promise<void> {
        if (!this.isAvailable()) {
            throw new Error(
                `navigator.sendBeacon is not supported in this browser. Consider adding a polyfill like "sendbeacon-polyfill".`
            );
        }

        const {baseUrl, preprocessRequest} = this.opts;
        const parsedRequestData = this.encodeForEventType(eventType, payload);
        const paramsFragments = await this.getQueryParamsForEventType(eventType);
        const defaultOptions: IAnalyticsRequestOptions = {
            url: `${baseUrl}/analytics/${eventType}?${paramsFragments}`,
            body: new Blob([parsedRequestData], {
                type: 'application/x-www-form-urlencoded',
            }),
        };
        const {url, body}: IAnalyticsRequestOptions = {
            ...defaultOptions,
            ...(preprocessRequest ? await preprocessRequest(defaultOptions, 'analyticsBeacon') : {}),
        };

        navigator.sendBeacon(url, body as any); // https://github.com/microsoft/TypeScript/issues/38715
        return;
    }

    public isAvailable() {
        return 'sendBeacon' in navigator;
    }

    public deleteHttpCookieVisitorId() {
        return Promise.resolve();
    }

    private encodeForEventType(eventType: EventType, payload: IRequestPayload): string {
        return this.isEventTypeLegacy(eventType)
            ? this.encodeForLegacyType(eventType, payload)
            : this.encodeForFormUrlEncoded({
                  access_token: this.opts.token,
                  ...payload,
              });
    }

    private async getQueryParamsForEventType(eventType: EventType): Promise<string> {
        const {token, visitorIdProvider} = this.opts;
        const visitorId = await visitorIdProvider.getCurrentVisitorId();
        return [
            token && this.isEventTypeLegacy(eventType) ? `access_token=${token}` : '',
            visitorId ? `visitorId=${visitorId}` : '',
            'discardVisitInfo=true',
        ]
            .filter((p) => !!p)
            .join('&');
    }

    private isEventTypeLegacy(eventType: EventType) {
        return [EventType.click, EventType.custom, EventType.search, EventType.view].indexOf(eventType) !== -1;
    }

    private encodeForLegacyType(eventType: EventType, payload: IRequestPayload): string {
        return `${eventType}Event=${encodeURIComponent(JSON.stringify(payload))}`;
    }

    private encodeForFormUrlEncoded(payload: IRequestPayload): string {
        return Object.keys(payload)
            .filter((key) => !!payload[key])
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(this.encodeValue(payload[key]))}`)
            .join('&');
    }

    private encodeValue(value: any) {
        return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean'
            ? value
            : JSON.stringify(value);
    }
}
