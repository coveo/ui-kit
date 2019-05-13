import { AnalyticsRequestClient, VisitorIdProvider } from './analyticsRequestClient';
import { EventType, IRequestPayload } from '../events';

export interface IAnalyticsBeaconClientOptions {
    baseUrl: string;
    token: string;
    visitorIdProvider: VisitorIdProvider;
}

export class AnalyticsBeaconClient implements AnalyticsRequestClient {
    constructor(private opts: IAnalyticsBeaconClientOptions) { }

    public async sendEvent(eventType: EventType, payload: IRequestPayload): Promise<void> {
        if (!navigator.sendBeacon) {
            throw new Error(`navigator.sendBeacon is not supported in this browser. Consider adding a polyfill like "sendbeacon-polyfill".`);
        }

        const {
            baseUrl,
            token,
            visitorIdProvider
        } = this.opts;

        const parsedRequestDataKey = this.getParsedRequestDataKey(eventType);
        const parsedRequestData = `${parsedRequestDataKey}=${encodeURIComponent(JSON.stringify(payload))}`;
        const visitorId = visitorIdProvider.currentVisitorId;
        const queryParams = `?access_token=${token}${visitorId ? `&visitorId=${visitorId}` : ''}`;
        const url = `${baseUrl}/analytics/${eventType}${queryParams}`;
        // tslint:disable-next-line: no-console
        console.log(`Sending beacon for "${eventType}" with: `, JSON.stringify(payload));
        navigator.sendBeacon(url, new Blob([parsedRequestData], { type: 'application/x-www-form-urlencoded' }));
        return;
    }

    private getParsedRequestDataKey(eventType: EventType): string {
        return `${eventType}Event`;
    }
}
