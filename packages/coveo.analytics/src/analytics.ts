import {
    SearchEventRequest, SearchEventResponse,
    ClickEventRequest, ClickEventResponse,
    CustomEventRequest, CustomEventResponse,
    ViewEventRequest, ViewEventResponse,
    VisitResponse, HealthResponse
} from './events';
import { AnalyticsClient } from './analyticsclient';
import { HistoryStore } from './history';
import { hasDocumentLocation } from './detector';
import 'whatwg-fetch';

export const Version = 'v15';

export const Endpoints = {
  default: 'https://usageanalytics.coveo.com',
  production: 'https://usageanalytics.coveo.com',
  dev: 'https://usageanalyticsdev.coveo.com',
  staging: 'https://usageanalyticsstaging.coveo.com'
};

export interface ClientOptions {
  token?: string;
  endpoint?: string;
  version?: string;
};

function defaultResponseTransformer(response: Response): Promise<any> {
    return response.json().then((data: any) => {
        data.raw = response;
        return data;
    });
}

export class Client implements AnalyticsClient {
    private endpoint: string;
    private token: string;
    private version: string;

    constructor(opts: ClientOptions) {
        if (typeof opts === 'undefined') {
            throw new Error('You have to pass options to this constructor');
        }

        this.endpoint = opts.endpoint || Endpoints.default;
        this.token = opts.token;
        this.version = opts.version || Version;
    }

    sendEvent(eventType: string, request: any): Promise<Response> {
        return fetch(`${this.getRestEndpoint()}/analytics/${eventType}`, {
            method: 'POST',
            headers: this.getHeaders(),
            mode: 'cors',
            body: JSON.stringify(request),
            credentials: 'include'
        });
    }

    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse> {
        return this.sendEvent('search', request).then(defaultResponseTransformer);
    }

    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse> {
        return this.sendEvent('click', request).then(defaultResponseTransformer);
    }

    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse> {
        return this.sendEvent('custom', request).then(defaultResponseTransformer);
    }

    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse> {
        if (request.referrer === '') { delete request.referrer; }

        // Check if we are in a browser env
        if (hasDocumentLocation()) {
            const store = new HistoryStore();
            const historyElement = {
                name: 'PageView',
                value: document.location.toString(),
                time: JSON.stringify(new Date()),
                title: document.title
            };
            store.addElement(historyElement);
        }

        return this.sendEvent('view', request).then(defaultResponseTransformer);
    }

    getVisit(): Promise<VisitResponse> {
        return fetch(`${this.getRestEndpoint()}/analytics/visit`)
            .then(defaultResponseTransformer);
    }

    getHealth(): Promise<HealthResponse> {
        return fetch(`${this.getRestEndpoint()}/analytics/monitoring/health`)
            .then(defaultResponseTransformer);
    }

    protected getRestEndpoint(): string {
        return `${this.endpoint}/rest/${this.version}`;
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

export default Client;
