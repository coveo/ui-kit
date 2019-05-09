import {
    AnyEventResponse,
    ClickEventRequest,
    ClickEventResponse,
    CustomEventRequest,
    CustomEventResponse,
    EventBaseRequest,
    HealthResponse,
    SearchEventRequest,
    SearchEventResponse,
    ViewEventRequest,
    ViewEventResponse,
    VisitResponse
    } from '../events';
import { HistoryStore } from '../history';

export const Version = 'v15';

export const Endpoints = {
    default: 'https://usageanalytics.coveo.com',
    production: 'https://usageanalytics.coveo.com',
    hipaa: 'https://usageanalyticshipaa.coveo.com'
};

export interface ClientOptions {
    token: string;
    endpoint: string;
    version: string;
}

export enum EventType {
    search = 'search',
    click = 'click',
    custom = 'custom',
    view = 'view'
}

export type IRequestPayload = Record<string, any>;

export interface AnalyticsClient {
    sendEvent(eventType: string, payload: any): Promise<AnyEventResponse>;
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse>;
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse>;
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse>;
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse>;
    getVisit(): Promise<VisitResponse>;
    getHealth(): Promise<HealthResponse>;
}

export class CoveoAnalyticsClient implements AnalyticsClient {
    private get defaultOptions(): ClientOptions {
        return {
            endpoint: Endpoints.default,
            token: '',
            version: Version
        };
    }

    private options: ClientOptions;

    constructor(opts: Partial<ClientOptions>) {
        if (!opts) {
            throw new Error('You have to pass options to this constructor');
        }

        this.options = {
            ...this.defaultOptions,
            ...opts
        };
        this.assertTokenIsDefined();
    }

    private assertTokenIsDefined() {
        const { token } = this.options;
        if (!token) {
            throw new Error('You have to pass at least a token to this constructor');
        }
    }

    async sendEvent(eventType: EventType, payload: IRequestPayload): Promise<AnyEventResponse> {
        if (eventType === 'view') {
            this.addPageViewToHistory(payload.contentIdValue);
        }

        const augmentedPayload = this.augmentPayloadForTypeOfEvent(eventType, payload);
        const cleanedPayload = this.removeEmptyPayloadValues(augmentedPayload);

        const response = await fetch(`${this.getRestEndpoint()}/analytics/${eventType}`, {
            method: 'POST',
            headers: this.getHeaders(),
            mode: 'cors',
            body: JSON.stringify(cleanedPayload),
            credentials: 'include'
        });
        if (response.ok) {
            return await response.json() as AnyEventResponse;
        } else {
            console.error(`An error has occured when sending the "${eventType}" event.`, response, payload);
            throw new Error(`An error has occurred when sending the "${eventType}" event. Check the console logs for more details.`);
        }
    }

    async sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse> {
        return this.sendEvent(EventType.search, request);
    }

    async sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse> {
        return this.sendEvent(EventType.click, request);
    }

    async sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse> {
        return this.sendEvent(EventType.custom, request);
    }

    async sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse> {
        return this.sendEvent(EventType.view, request);
    }

    async getVisit(): Promise<VisitResponse> {
        const response = await fetch(`${this.getRestEndpoint()}/analytics/visit`);
        return response.json();
    }

    async getHealth(): Promise<HealthResponse> {
        const response = await fetch(`${this.getRestEndpoint()}/analytics/monitoring/health`);
        return response.json();
    }

    private augmentPayloadForTypeOfEvent(eventType: EventType, payload: IRequestPayload): IRequestPayload {
        const baseDefaultValues: EventBaseRequest = {
            language: document.documentElement.lang,
            userAgent: navigator.userAgent
        };
        if (eventType === 'view') {
            return {
                location: window.location.toString(),
                referrer: document.referrer,
                title: document.title,
                ...baseDefaultValues,
                ...payload
            } as ViewEventRequest;
        } else {
            return {
                ...baseDefaultValues,
                ...payload
            };
        }
    }

    private removeEmptyPayloadValues(payload: IRequestPayload): IRequestPayload {
        return Object.keys(payload)
            .filter(key => !!payload[key])
            .reduce((newPayload, key) => ({
                ...newPayload,
                [key]: payload[key]
            }), {});
    }

    private addPageViewToHistory(pageViewValue: string): void {
        const store = new HistoryStore();
        const historyElement = {
            name: 'PageView',
            value: pageViewValue,
            time: JSON.stringify(new Date()),
        };
        store.addElement(historyElement);
    }

    private getRestEndpoint(): string {
        const { endpoint, version } = this.options;
        return `${endpoint}/rest/${version}`;
    }

    private getHeaders(): Record<string, string> {
        const { token } = this.options;
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `application/json`
        };
    }
}

/** @deprecated Use CoveoAnalyticsClient instead. */
export const Client = CoveoAnalyticsClient;

export default CoveoAnalyticsClient;
