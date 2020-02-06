import { AnalyticsBeaconClient as AnalyticsBeaconClient } from './analyticsBeaconClient';
import { AnalyticsFetchClient } from './analyticsFetchClient';
import {
    AnyEventResponse,
    ClickEventRequest,
    ClickEventResponse,
    CustomEventRequest,
    CustomEventResponse,
    EventType,
    HealthResponse,
    SearchEventRequest,
    SearchEventResponse,
    ViewEventRequest,
    ViewEventResponse,
    VisitResponse,
    IRequestPayload,
    VariableArgumentsPayload,
} from '../events';
import { VisitorIdProvider } from './analyticsRequestClient';
import { WebStorage, CookieStorage } from '../storage';
import { hasLocalStorage, hasCookieStorage } from '../detector';
import { addDefaultValues } from '../hook/addDefaultValues';
import { enhanceViewEvent } from '../hook/enhanceViewEvent';

export const Version = 'v15';

export const Endpoints = {
    default: 'https://usageanalytics.coveo.com',
    production: 'https://usageanalytics.coveo.com',
    hipaa: 'https://usageanalyticshipaa.coveo.com'
};

export interface ClientOptions {
    token?: string;
    endpoint: string;
    version: string;
}

export type AnalyticsClientSendEventHook = <TResult>(eventType: string, payload: any) => TResult;
export type EventTypeConfig = {
    newEventType: EventType;
    variableLengthArgumentsNames?: string[];
    addDefaultContextInformation?: boolean;
};

export type DefaultContextInformation = typeof CoveoAnalyticsClient.prototype.defaultContextInformation;

export interface AnalyticsClient {
    sendEvent(eventType: string, ...payload: VariableArgumentsPayload): Promise<AnyEventResponse | void>;
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse | void>;
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse | void>;
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse | void>;
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse | void>;
    getVisit(): Promise<VisitResponse>;
    getHealth(): Promise<HealthResponse>;
    registerBeforeSendEventHook(hook: AnalyticsClientSendEventHook): void;
    addEventTypeMapping(eventType: string, eventConfig: EventTypeConfig): void;
}

interface BufferedRequest {
    eventType: EventType;
    payload: any;
    handled: boolean;
}

export class CoveoAnalyticsClient implements AnalyticsClient, VisitorIdProvider {
    private get defaultOptions(): ClientOptions {
        return {
            endpoint: Endpoints.default,
            token: '',
            version: Version
        };
    }

    private visitorId: string;
    private cookieStorage: WebStorage;
    private analyticsBeaconClient: AnalyticsBeaconClient;
    private analyticsFetchClient: AnalyticsFetchClient;
    private bufferedRequests: BufferedRequest[];
    private beforeSendHooks: AnalyticsClientSendEventHook[];
    private eventTypeMapping: {[name: string]: EventTypeConfig};
    private options: ClientOptions;

    constructor(opts: Partial<ClientOptions>) {
        if (!opts) {
            throw new Error('You have to pass options to this constructor');
        }

        this.options = {
            ...this.defaultOptions,
            ...opts
        };

        const {
            token,
        } = this.options;

        this.cookieStorage = new CookieStorage();
        this.visitorId = '';
        this.bufferedRequests = [];
        this.beforeSendHooks = [
            enhanceViewEvent,
            addDefaultValues,
        ];
        this.eventTypeMapping = {};

        const clientsOptions = {
            baseUrl: this.baseUrl,
            token,
            visitorIdProvider: this
        };
        this.analyticsBeaconClient = new AnalyticsBeaconClient(clientsOptions);
        this.analyticsFetchClient = new AnalyticsFetchClient(clientsOptions);
        window.addEventListener('beforeunload', () => this.flushBufferWithBeacon());
    }

    get currentVisitorId() {
        return this.visitorId || (hasCookieStorage() && this.cookieStorage.getItem('visitorId')) || (hasLocalStorage() && localStorage.getItem('visitorId')) || '';
    }

    set currentVisitorId(visitorId: string) {
        this.visitorId = visitorId;
        if (hasCookieStorage()) {
            this.cookieStorage.setItem('visitorId', visitorId);
        }
        if (hasLocalStorage()) {
            localStorage.setItem('visitorId', visitorId);
        }
    }

    async sendEvent(eventType: EventType, ...payload: VariableArgumentsPayload): Promise<AnyEventResponse | void> {
        const {
            newEventType: eventTypeToSend = eventType,
            variableLengthArgumentsNames = [],
            addDefaultContextInformation = false
        } = this.eventTypeMapping[eventType] || {};

        const payloadToProcess = variableLengthArgumentsNames.length > 0
            ? this.parseVariableArgumentsPayload(variableLengthArgumentsNames, payload)
            : payload[0];

        const processedPayload = this.beforeSendHooks.reduce((newPayload, current) => current(eventType, newPayload), {
            ...(addDefaultContextInformation ? this.defaultContextInformation : {}),
            ...payloadToProcess,
        });
        const cleanedPayload = this.removeEmptyPayloadValues(processedPayload);
        this.bufferedRequests.push({
            eventType: eventTypeToSend,
            payload: cleanedPayload,
            handled: false
        });

        await this.deferExecution();
        return await this.sendFromBufferWithFetch();
    }

    private deferExecution(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    private flushBufferWithBeacon(): void {
        while (this.hasPendingRequests()) {
            const { eventType, payload } = this.bufferedRequests.pop() as BufferedRequest;
            this.analyticsBeaconClient.sendEvent(eventType, payload);
        }
    }

    private async sendFromBufferWithFetch(): Promise<AnyEventResponse | void> {
        const popped = this.bufferedRequests.shift();
        if (popped) {
            const { eventType, payload } = popped;
            return this.analyticsFetchClient.sendEvent(eventType, payload);
        }
    }

    private hasPendingRequests(): boolean {
        return this.bufferedRequests.length > 0;
    }

    async sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse | void> {
        return this.sendEvent(EventType.search, request);
    }

    async sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse | void> {
        return this.sendEvent(EventType.click, request);
    }

    async sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse | void> {
        return this.sendEvent(EventType.custom, request);
    }

    async sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse | void> {
        return this.sendEvent(EventType.view, request);
    }

    async getVisit(): Promise<VisitResponse> {
        const response = await fetch(`${this.baseUrl}/analytics/visit`);
        const visit = await response.json() as VisitResponse;
        this.visitorId = visit.visitorId;
        return visit;
    }

    async getHealth(): Promise<HealthResponse> {
        const response = await fetch(`${this.baseUrl}/analytics/monitoring/health`);
        return await response.json() as HealthResponse;
    }

    registerBeforeSendEventHook(hook: AnalyticsClientSendEventHook): void {
        this.beforeSendHooks.push(hook);
    }

    addEventTypeMapping(eventType: string, eventConfig: EventTypeConfig): void {
        this.eventTypeMapping[eventType] = eventConfig;
    }

    private parseVariableArgumentsPayload(fieldsOrder: string[], payload: VariableArgumentsPayload) {
        const parsedArguments: {[name: string]: any} = {};
        for (let i = 0, length = payload.length; i < length; i++) {
            const currentArgument = payload[i];
            if (typeof(currentArgument) === 'string') {
                parsedArguments[fieldsOrder[i]] = currentArgument;
            } else if (typeof(currentArgument) === 'object') {
                // If the argument is an object, it is considered the last argument of the chain. Its values should be returned as-is.
                return {
                    ...parsedArguments,
                    ...currentArgument,
                };
            }
        }
        return parsedArguments;
    }

    private removeEmptyPayloadValues(payload: IRequestPayload): IRequestPayload {
        return Object.keys(payload)
            .filter(key => !!payload[key])
            .reduce((newPayload, key) => ({
                ...newPayload,
                [key]: payload[key]
            }), {});
    }

    private get baseUrl(): string {
        const { version, endpoint } = this.options;
        return `${endpoint}/rest/${version}`;
    }

    get defaultContextInformation() {
        return {
            clientId: this.visitorId,
            location: `${location.protocol}//${location.hostname}${location.pathname.indexOf('/') === 0 ? location.pathname : `/${location.pathname}`}${location.search}`,
            referrer: document.referrer,
            screenResolution: `${screen.width}x${screen.height}`,
            screenColor: `${screen.colorDepth}-bit`,
            encoding: document.characterSet,
            language: navigator.language,
            title: document.title,
            userAgent: navigator.userAgent,
        };
    }
}

export default CoveoAnalyticsClient;
