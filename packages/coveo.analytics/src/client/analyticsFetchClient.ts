import { AnalyticsRequestClient } from './analyticsRequestClient';
import {
    AnyEventResponse,
    EventBaseRequest,
    EventType,
    ViewEventRequest
    } from '../events';

export interface ClientOptions {
    token?: string;
    endpoint?: string;
    version?: string;
    visitorId?: string;
}

export interface VisitorIdProvider {
    currentVisitorId: string;
}

export class AnalyticsFetchClient implements AnalyticsRequestClient {
    constructor(private baseUrl: string,
        private token: string,
        private visitorIdProvider: VisitorIdProvider) {
    }

    public async sendEvent(eventType: EventType, payload: any): Promise<AnyEventResponse> {
        const response = await fetch(`${this.baseUrl}/analytics/${eventType}`, {
            method: 'POST',
            headers: this.getHeaders(),
            mode: 'cors',
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        if (response.ok) {
            const visit = await response.json() as AnyEventResponse;
            this.visitorIdProvider.currentVisitorId = visit.visitorId;
            return visit;
        } else {
            console.error(`An error has occured when sending the "${eventType}" event.`, response, payload);
            throw new Error(`An error has occurred when sending the "${eventType}" event. Check the console logs for more details.`);
        }
    }

    protected getHeaders(): any {
        var headers: any = {
            'Content-Type': `application/json`
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
}
