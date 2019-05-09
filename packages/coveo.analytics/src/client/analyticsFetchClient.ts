import { AnalyticsRequestClient, VisitorIdProvider } from './analyticsRequestClient';
import {
    AnyEventResponse,
    EventType,
    IRequestPayload
} from '../events';

export interface IAnalyticsFetchClientOptions {
    baseUrl: string;
    token: string;
    visitorIdProvider: VisitorIdProvider;
}

export class AnalyticsFetchClient implements AnalyticsRequestClient {
    constructor(private opts: IAnalyticsFetchClientOptions) {
    }

    public async sendEvent(eventType: EventType, payload: IRequestPayload): Promise<AnyEventResponse> {
        const {
            baseUrl,
            visitorIdProvider
        } = this.opts;

        const response = await fetch(`${baseUrl}/analytics/${eventType}`, {
            method: 'POST',
            headers: this.getHeaders(),
            mode: 'cors',
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        if (response.ok) {
            const visit = await response.json() as AnyEventResponse;
            visitorIdProvider.currentVisitorId = visit.visitorId;
            return visit;
        } else {
            console.error(`An error has occured when sending the "${eventType}" event.`, response, payload);
            throw new Error(`An error has occurred when sending the "${eventType}" event. Check the console logs for more details.`);
        }
    }

    private getHeaders(): Record<string, string> {
        const {
            token
        } = this.opts;
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `application/json`
        };
    }
}
