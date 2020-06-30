import {AnalyticsRequestClient, VisitorIdProvider} from './analyticsRequestClient';
import {EventType, IRequestPayload} from '../events';

export interface IAnalyticsBeaconClientOptions {
    baseUrl: string;
    token?: string;
    visitorIdProvider: VisitorIdProvider;
}

export class AnalyticsBeaconClient implements AnalyticsRequestClient {
    constructor(private opts: IAnalyticsBeaconClientOptions) {}

    public async sendEvent(eventType: EventType, payload: IRequestPayload): Promise<void> {
        if (!navigator.sendBeacon) {
            throw new Error(
                `navigator.sendBeacon is not supported in this browser. Consider adding a polyfill like "sendbeacon-polyfill".`
            );
        }

        const {baseUrl} = this.opts;
        const parsedRequestData = this.encodeForEventType(eventType, payload);
        const paramsFragments = this.getQueryParamsForEventType(eventType);
        const url = `${baseUrl}/analytics/${eventType}?${paramsFragments}`;
        // tslint:disable-next-line: no-console
        console.log(`Sending beacon for "${eventType}" with: `, JSON.stringify(payload));
        navigator.sendBeacon(
            url,
            new Blob([parsedRequestData], {
                type: 'application/x-www-form-urlencoded',
            })
        );
        return;
    }

    private encodeForEventType(eventType: EventType, payload: IRequestPayload): string {
        return this.isEventTypeLegacy(eventType)
            ? this.encodeForLegacyType(eventType, payload)
            : this.encodeForFormUrlEncoded({
                  access_token: this.opts.token,
                  ...payload,
              });
    }

    private getQueryParamsForEventType(eventType: EventType): string {
        const {token, visitorIdProvider} = this.opts;
        const visitorId = visitorIdProvider.currentVisitorId;
        return [
            token && this.isEventTypeLegacy(eventType) ? `access_token=${token}` : '',
            visitorId ? `visitorId=${visitorId}` : '',
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

export class NoopAnalyticsBeaconClient implements AnalyticsRequestClient {
    public async sendEvent(_: EventType, __: IRequestPayload): Promise<void> {
        return Promise.resolve();
    }
}
