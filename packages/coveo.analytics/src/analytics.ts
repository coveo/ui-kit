import {
    SearchEventRequest, SearchEventResponse,
    ClickEventRequest, ClickEventResponse,
    CustomEventRequest, CustomEventResponse,
    ViewEventRequest, ViewEventResponse,
    VisitResponse, HealthResponse
} from './events';
import { AnalyticsClient } from './analyticsclient';

export const Version = 'v15';

export const Endpoints = {
  default: 'https://usageanalytics.coveo.com/rest/' + Version,
  production: 'https://usageanalytics.coveo.com/rest/' + Version,
  dev: 'https://usageanalyticsdev.coveo.com/rest/' + Version,
  staging: 'https://usageanalyticsstaging.coveo.com/rest/' + Version
};

export interface ClientOptions {
  token?: string;
  endpoint?: string;
};

function defaultResponseTransformer(response: IResponse): Promise<any> {
    return response.json().then((data: any) => {
        data.raw = response;
        return data;
    });
}

export class Client implements AnalyticsClient {
    private endpoint: string;
    private token: string;

    constructor(opts: ClientOptions) {
        if (typeof opts === 'undefined') {
            throw new Error('You have to pass options to this constructor');
        }

        this.endpoint = opts.endpoint || Endpoints.default;
        this.token = opts.token || '';
    }

    sendEvent(eventType: string, request: any): Promise<IResponse> {
        var headers: any = {};
        this.applyHeaders(headers);
        return fetch(`${this.endpoint}/analytics/${eventType}`, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: JSON.stringify(request)
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
        return this.sendEvent('view', request).then(defaultResponseTransformer);
    }

    getVisit(): Promise<VisitResponse> {
        return fetch(this.endpoint + '/analytics/visit')
            .then(defaultResponseTransformer);
    }

    getHealth(): Promise<HealthResponse> {
        return fetch(this.endpoint + '/analytics/monitoring/health')
            .then(defaultResponseTransformer);
    }

    protected applyHeaders(headers: any) {
        this.applyDefaultHeaders(headers);
    }

    protected applyDefaultHeaders(headers: any) {
        if (this.token !== '') {
            headers['Authorization'] = `Bearer ${this.token}`;
            headers['Content-Type'] = `application/json`;
        }
    }
}

export default Client;
