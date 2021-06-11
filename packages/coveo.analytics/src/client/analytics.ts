import {IAnalyticsBeaconClientOptions} from './analyticsBeaconClient';
import {AnalyticsFetchClient, IAnalyticsFetchClientOptions} from './analyticsFetchClient';
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
import {PreprocessAnalyticsRequest, VisitorIdProvider} from './analyticsRequestClient';
import {hasWindow, hasDocument} from '../detector';
import {addDefaultValues} from '../hook/addDefaultValues';
import {enhanceViewEvent} from '../hook/enhanceViewEvent';
import {uuidv4} from './crypto';
import {
    convertKeysToMeasurementProtocol,
    isMeasurementProtocolKey,
    convertCustomMeasurementProtocolKeys,
} from './measurementProtocolMapper';
import {IRuntimeEnvironment, BrowserRuntime, NodeJSRuntime} from './runtimeEnvironment';
import HistoryStore from '../history';
import {isApiKey} from './token';
import {isReactNative, ReactNativeRuntimeWarning} from '../react-native/react-native-utils';

export const Version = 'v15';

export const Endpoints = {
    default: 'https://analytics.cloud.coveo.com/rest/ua',
    production: 'https://analytics.cloud.coveo.com/rest/ua',
    hipaa: 'https://analyticshipaa.cloud.coveo.com/rest/ua',
};

export interface ClientOptions {
    token?: string;
    endpoint: string;
    version: string;
    runtimeEnvironment?: IRuntimeEnvironment;
    beforeSendHooks: AnalyticsClientSendEventHook[];
    afterSendHooks: AnalyticsClientSendEventHook[];
    preprocessRequest?: PreprocessAnalyticsRequest;
}

export type AnalyticsClientSendEventHook = <TResult>(eventType: string, payload: any) => TResult | Promise<TResult>;
export type EventTypeConfig = {
    newEventType: EventType;
    variableLengthArgumentsNames?: string[];
    addVisitorIdParameter?: boolean;
    usesMeasurementProtocol?: boolean;
};

export interface AnalyticsClient {
    getPayload(eventType: string, ...payload: VariableArgumentsPayload): Promise<any>;
    getParameters(eventType: string, ...payload: VariableArgumentsPayload): Promise<any>;
    sendEvent(eventType: string, ...payload: VariableArgumentsPayload): Promise<AnyEventResponse | void>;
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse | void>;
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse | void>;
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse | void>;
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse | void>;
    getVisit(): Promise<VisitResponse>;
    getHealth(): Promise<HealthResponse>;
    registerBeforeSendEventHook(hook: AnalyticsClientSendEventHook): void;
    registerAfterSendEventHook(hook: AnalyticsClientSendEventHook): void;
    addEventTypeMapping(eventType: string, eventConfig: EventTypeConfig): void;
    runtime: IRuntimeEnvironment;
    readonly currentVisitorId: string;
}

interface BufferedRequest {
    eventType: EventType;
    payload: any;
    handled: boolean;
}

type ProcessPayloadStep = (currentPayload: any) => any;
type AsyncProcessPayloadStep = (currentPayload: any) => Promise<any>;

export class CoveoAnalyticsClient implements AnalyticsClient, VisitorIdProvider {
    private get defaultOptions(): ClientOptions {
        return {
            endpoint: Endpoints.default,
            token: '',
            version: Version,
            beforeSendHooks: [],
            afterSendHooks: [],
        };
    }

    public runtime: IRuntimeEnvironment;
    private visitorId: string;
    private analyticsFetchClient: AnalyticsFetchClient;
    private bufferedRequests: BufferedRequest[];
    private beforeSendHooks: AnalyticsClientSendEventHook[];
    private afterSendHooks: AnalyticsClientSendEventHook[];
    private eventTypeMapping: {[name: string]: EventTypeConfig};
    private options: ClientOptions;

    constructor(opts: Partial<ClientOptions>) {
        if (!opts) {
            throw new Error('You have to pass options to this constructor');
        }

        this.options = {
            ...this.defaultOptions,
            ...opts,
        };

        this.visitorId = '';
        this.bufferedRequests = [];
        this.beforeSendHooks = [enhanceViewEvent, addDefaultValues].concat(this.options.beforeSendHooks);
        this.afterSendHooks = this.options.afterSendHooks;
        this.eventTypeMapping = {};

        const clientsOptions: IAnalyticsFetchClientOptions = {
            baseUrl: this.baseUrl,
            token: this.options.token,
            visitorIdProvider: this,
            preprocessRequest: this.options.preprocessRequest,
        };

        this.runtime = this.options.runtimeEnvironment || this.initRuntime(clientsOptions);
        this.analyticsFetchClient = new AnalyticsFetchClient(clientsOptions);
    }

    private initRuntime(clientsOptions: IAnalyticsBeaconClientOptions) {
        if (hasWindow() && hasDocument()) {
            return new BrowserRuntime(clientsOptions, () => this.flushBufferWithBeacon());
        } else if (isReactNative()) {
            console.warn(ReactNativeRuntimeWarning);
        }
        return new NodeJSRuntime(clientsOptions);
    }

    private get analyticsBeaconClient() {
        return this.runtime.beaconClient;
    }

    private get storage() {
        return this.runtime.storage;
    }

    private async determineVisitorId() {
        try {
            return (await this.storage.getItem('visitorId')) || uuidv4();
        } catch (err) {
            console.log(
                'Could not get visitor ID from the current runtime environment storage. Using a random ID instead.',
                err
            );
            return uuidv4();
        }
    }

    async getCurrentVisitorId() {
        if (!this.visitorId) {
            const id = await this.determineVisitorId();
            await this.setCurrentVisitorId(id);
        }
        return this.visitorId;
    }

    async setCurrentVisitorId(visitorId: string) {
        this.visitorId = visitorId;
        await this.storage.setItem('visitorId', visitorId);
    }

    async getParameters(eventType: EventType | string, ...payload: VariableArgumentsPayload) {
        return await this.resolveParameters(eventType, ...payload);
    }

    async getPayload(eventType: EventType | string, ...payload: VariableArgumentsPayload) {
        const parametersToSend = await this.resolveParameters(eventType, ...payload);
        return await this.resolvePayloadForParameters(eventType, parametersToSend);
    }

    /**
     * @deprecated Synchronous method is deprecated, use getCurrentVisitorId instead. This method will NOT work with react-native.
     */
    get currentVisitorId() {
        const visitorId = this.visitorId || this.storage.getItem('visitorId');
        if (typeof visitorId !== 'string') {
            this.setCurrentVisitorId(uuidv4());
        }
        return this.visitorId;
    }

    /**
     * @deprecated Synchronous method is deprecated, use setCurrentVisitorId instead. This method will NOT work with react-native.
     */
    set currentVisitorId(visitorId: string) {
        this.visitorId = visitorId;
        this.storage.setItem('visitorId', visitorId);
    }

    async resolveParameters(eventType: EventType | string, ...payload: VariableArgumentsPayload) {
        const {variableLengthArgumentsNames = [], addVisitorIdParameter = false, usesMeasurementProtocol = false} =
            this.eventTypeMapping[eventType] || {};

        const processVariableArgumentNamesStep: ProcessPayloadStep = (currentPayload) =>
            variableLengthArgumentsNames.length > 0
                ? this.parseVariableArgumentsPayload(variableLengthArgumentsNames, currentPayload)
                : currentPayload[0];
        const addVisitorIdStep: AsyncProcessPayloadStep = async (currentPayload) => ({
            ...currentPayload,
            visitorId: addVisitorIdParameter ? await this.getCurrentVisitorId() : '',
        });
        const setAnonymousUserStep: ProcessPayloadStep = (currentPayload) =>
            usesMeasurementProtocol ? this.ensureAnonymousUserWhenUsingApiKey(currentPayload) : currentPayload;
        const processBeforeSendHooksStep: AsyncProcessPayloadStep = (currentPayload) =>
            this.beforeSendHooks.reduce(async (promisePayload, current) => {
                const payload = await promisePayload;
                return await current(eventType, payload);
            }, currentPayload);

        const parametersToSend = await [
            processVariableArgumentNamesStep,
            addVisitorIdStep,
            setAnonymousUserStep,
            processBeforeSendHooksStep,
        ].reduce(async (payloadPromise, step) => {
            const payload = await payloadPromise;
            return await step(payload);
        }, Promise.resolve(payload));

        return parametersToSend;
    }

    async resolvePayloadForParameters(eventType: EventType | string, parameters: any) {
        const {usesMeasurementProtocol = false} = this.eventTypeMapping[eventType] || {};

        const cleanPayloadStep: ProcessPayloadStep = (currentPayload) =>
            this.removeEmptyPayloadValues(currentPayload, eventType);
        const validateParams: ProcessPayloadStep = (currentPayload) => this.validateParams(currentPayload);
        const processMeasurementProtocolConversionStep: ProcessPayloadStep = (currentPayload) =>
            usesMeasurementProtocol ? convertKeysToMeasurementProtocol(currentPayload) : currentPayload;
        const removeUnknownParameters: ProcessPayloadStep = (currentPayload) =>
            usesMeasurementProtocol ? this.removeUnknownParameters(currentPayload) : currentPayload;
        const processCustomParameters: ProcessPayloadStep = (currentPayload) =>
            usesMeasurementProtocol ? this.processCustomParameters(currentPayload) : currentPayload;

        const payloadToSend = await [
            cleanPayloadStep,
            validateParams,
            processMeasurementProtocolConversionStep,
            removeUnknownParameters,
            processCustomParameters,
        ].reduce(async (payloadPromise, step) => {
            const payload = await payloadPromise;
            return await step(payload);
        }, Promise.resolve(parameters));

        return payloadToSend;
    }

    async sendEvent(
        eventType: EventType | string,
        ...payload: VariableArgumentsPayload
    ): Promise<AnyEventResponse | void> {
        const {newEventType: eventTypeToSend = eventType as EventType} = this.eventTypeMapping[eventType] || {};

        const parametersToSend = await this.resolveParameters(eventType, ...payload);
        const payloadToSend = await this.resolvePayloadForParameters(eventType, parametersToSend);

        this.bufferedRequests.push({
            eventType: eventTypeToSend,
            payload: payloadToSend,
            handled: false,
        });

        await Promise.all(this.afterSendHooks.map((hook) => hook(eventType, parametersToSend)));

        await this.deferExecution();

        return await this.sendFromBufferWithFetch();
    }

    private deferExecution(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, 0));
    }

    private flushBufferWithBeacon(): void {
        while (this.hasPendingRequests()) {
            const {eventType, payload} = this.bufferedRequests.pop() as BufferedRequest;
            this.analyticsBeaconClient.sendEvent(eventType, payload);
        }
    }

    private async sendFromBufferWithFetch(): Promise<AnyEventResponse | void> {
        const popped = this.bufferedRequests.shift();
        if (popped) {
            const {eventType, payload} = popped;
            return this.analyticsFetchClient.sendEvent(eventType, payload);
        }
    }

    private hasPendingRequests(): boolean {
        return this.bufferedRequests.length > 0;
    }

    public clear() {
        this.storage.removeItem('visitorId');
        const store = new HistoryStore();
        store.clear();
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
        const visit = (await response.json()) as VisitResponse;
        this.visitorId = visit.visitorId;
        return visit;
    }

    async getHealth(): Promise<HealthResponse> {
        const response = await fetch(`${this.baseUrl}/analytics/monitoring/health`);
        return (await response.json()) as HealthResponse;
    }

    registerBeforeSendEventHook(hook: AnalyticsClientSendEventHook): void {
        this.beforeSendHooks.push(hook);
    }

    registerAfterSendEventHook(hook: AnalyticsClientSendEventHook): void {
        this.afterSendHooks.push(hook);
    }

    addEventTypeMapping(eventType: string, eventConfig: EventTypeConfig): void {
        this.eventTypeMapping[eventType] = eventConfig;
    }

    private parseVariableArgumentsPayload(fieldsOrder: string[], payload: VariableArgumentsPayload) {
        const parsedArguments: {[name: string]: any} = {};
        for (let i = 0, length = payload.length; i < length; i++) {
            const currentArgument = payload[i];
            if (typeof currentArgument === 'string') {
                parsedArguments[fieldsOrder[i]] = currentArgument;
            } else if (typeof currentArgument === 'object') {
                // If the argument is an object, it is considered the last argument of the chain. Its values should be returned as-is.
                return {
                    ...parsedArguments,
                    ...currentArgument,
                };
            }
        }
        return parsedArguments;
    }

    private isKeyAllowedEmpty(evtType: string, key: string) {
        const keysThatCanBeEmpty: Record<string, string[]> = {
            [EventType.search]: ['queryText'],
        };

        const match = keysThatCanBeEmpty[evtType] || [];
        return match.indexOf(key) !== -1;
    }

    private removeEmptyPayloadValues(payload: IRequestPayload, eventType: string): IRequestPayload {
        const isNotEmptyValue = (value: any) => typeof value !== 'undefined' && value !== null && value !== '';
        return Object.keys(payload)
            .filter((key) => this.isKeyAllowedEmpty(eventType, key) || isNotEmptyValue(payload[key]))
            .reduce(
                (newPayload, key) => ({
                    ...newPayload,
                    [key]: payload[key],
                }),
                {}
            );
    }

    private removeUnknownParameters(payload: IRequestPayload): IRequestPayload {
        const newPayload = Object.keys(payload)
            .filter((key) => {
                if (isMeasurementProtocolKey(key)) {
                    return true;
                } else {
                    console.log(key, 'is not processed by coveoua');
                }
            })
            .reduce(
                (newPayload, key) => ({
                    ...newPayload,
                    [key]: payload[key],
                }),
                {}
            );
        return newPayload;
    }

    private processCustomParameters(payload: IRequestPayload): IRequestPayload {
        const {custom, ...rest} = payload;

        const lowercasedCustom = this.lowercaseKeys(custom);

        const newPayload = convertCustomMeasurementProtocolKeys(rest);

        return {
            ...lowercasedCustom,
            ...newPayload,
        };
    }

    private lowercaseKeys(custom: any) {
        const keys = Object.keys(custom || {});

        return keys.reduce(
            (all, key) => ({
                ...all,
                [key.toLowerCase()]: custom[key],
            }),
            {}
        );
    }

    private validateParams(payload: IRequestPayload): IRequestPayload {
        const {anonymizeIp, ...rest} = payload;
        if (anonymizeIp !== undefined) {
            if (['0', 'false', 'undefined', 'null', '{}', '[]', ''].indexOf(`${anonymizeIp}`.toLowerCase()) == -1) {
                rest['anonymizeIp'] = 1;
            }
        }
        return rest;
    }

    private ensureAnonymousUserWhenUsingApiKey(payload: IRequestPayload): IRequestPayload {
        const {userId, ...rest} = payload;
        if (isApiKey(this.options.token) && !userId) {
            rest['userId'] = 'anonymous';
            return rest;
        } else {
            return payload;
        }
    }

    private get baseUrl(): string {
        const {version, endpoint} = this.options;
        const endpointIsCoveoProxy = endpoint.indexOf('.cloud.coveo.com') !== -1;
        return `${endpoint}${endpointIsCoveoProxy ? '' : '/rest'}/${version}`;
    }
}

export default CoveoAnalyticsClient;
