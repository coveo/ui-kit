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
    PreparedClickEventRequest,
    PreparedCustomEventRequest,
    PreparedViewEventRequest,
    PreparedSearchEventRequest,
} from '../events';
import {IAnalyticsClientOptions, PreprocessAnalyticsRequest, VisitorIdProvider} from './analyticsRequestClient';
import {hasWindow, hasDocument} from '../detector';
import {addDefaultValues} from '../hook/addDefaultValues';
import {enhanceViewEvent} from '../hook/enhanceViewEvent';
import {v4 as uuidv4, v5 as uuidv5, validate as uuidValidate} from 'uuid';
import {libVersion} from '../version';
import {CoveoLinkParam} from '../plugins/link';
import {
    convertKeysToMeasurementProtocol,
    isMeasurementProtocolKey,
    convertCustomMeasurementProtocolKeys,
} from './measurementProtocolMapper';
import {IRuntimeEnvironment, BrowserRuntime, NodeJSRuntime, NoopRuntime} from './runtimeEnvironment';
import HistoryStore from '../history';
import {isApiKey} from './token';
import {isReactNative, ReactNativeRuntimeWarning} from '../react-native/react-native-utils';
import {doNotTrack} from '../donottrack';
import {NullStorage} from '../storage';
import {isObject} from './utils';

export const Version = 'v15';

export const Endpoints = {
    default: 'https://analytics.cloud.coveo.com/rest/ua',
    production: 'https://analytics.cloud.coveo.com/rest/ua',
    hipaa: 'https://analyticshipaa.cloud.coveo.com/rest/ua',
};

export interface ClientOptions {
    token?: string;
    endpoint: string;
    isCustomEndpoint?: boolean;
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
    addClientIdParameter?: boolean;
    usesMeasurementProtocol?: boolean;
};

export interface PreparedEvent<TPreparedRequest, TCompleteRequest, TResponse extends AnyEventResponse>
    extends BufferedRequest {
    log(remainingPayload: Omit<TCompleteRequest, keyof TPreparedRequest>): Promise<TResponse | void>;
}

export interface AnalyticsClient {
    getPayload(eventType: string, ...payload: VariableArgumentsPayload): Promise<any>;
    getParameters(eventType: string, ...payload: VariableArgumentsPayload): Promise<any>;
    makeEvent<TPreparedRequest, TCompleteRequest, TResponse extends AnyEventResponse>(
        eventType: string,
        ...payload: VariableArgumentsPayload
    ): Promise<PreparedEvent<TPreparedRequest, TCompleteRequest, TResponse>>;
    sendEvent(eventType: string, ...payload: VariableArgumentsPayload): Promise<AnyEventResponse | void>;
    makeSearchEvent(
        request: PreparedSearchEventRequest
    ): Promise<PreparedEvent<PreparedSearchEventRequest, SearchEventRequest, SearchEventResponse>>;
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse | void>;
    makeClickEvent(
        request: PreparedClickEventRequest
    ): Promise<PreparedEvent<PreparedClickEventRequest, ClickEventRequest, ClickEventResponse>>;
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse | void>;
    makeCustomEvent(
        request: PreparedCustomEventRequest
    ): Promise<PreparedEvent<PreparedCustomEventRequest, CustomEventRequest, CustomEventResponse>>;
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse | void>;
    makeViewEvent(
        request: PreparedViewEventRequest
    ): Promise<PreparedEvent<PreparedViewEventRequest, ViewEventRequest, ViewEventResponse>>;
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse | void>;
    getVisit(): Promise<VisitResponse>;
    getHealth(): Promise<HealthResponse>;
    registerBeforeSendEventHook(hook: AnalyticsClientSendEventHook): void;
    registerAfterSendEventHook(hook: AnalyticsClientSendEventHook): void;
    addEventTypeMapping(eventType: string, eventConfig: EventTypeConfig): void;
    runtime: IRuntimeEnvironment;
    version: string;
    /**
     * @deprecated
     */
    readonly currentVisitorId: string;
    getCurrentVisitorId?(): Promise<string>; // TODO: v3 make required
    setAcceptedLinkReferrers?(hosts: string[]): void;
}

export interface BufferedRequest {
    eventType: EventType;
    payload: any;
}

type ProcessPayloadStep = (currentPayload: any) => any;
type AsyncProcessPayloadStep = (currentPayload: any) => Promise<any>;

export function buildBaseUrl(endpoint = Endpoints.default, apiVersion = Version, isCustomEndpoint = false) {
    endpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash in endpoint.

    if (isCustomEndpoint) {
        return `${endpoint}/${apiVersion}`;
    }

    const hasUARestEndpoint = endpoint.endsWith('/rest') || endpoint.endsWith('/rest/ua');

    return `${endpoint}${hasUARestEndpoint ? '' : '/rest'}/${apiVersion}`;
}

// Note: Changing this value will destroy the mapping from tracking string to clientId for all customers
// using the setClientId() api. It will have the same effect as every visitor for those customers clearing
// their cookie store at the same time, with corresponding downstream effects.
const COVEO_NAMESPACE = '38824e1f-37f5-42d3-8372-a4b8fa9df946';

export class CoveoAnalyticsClient implements AnalyticsClient, VisitorIdProvider {
    private get defaultOptions(): ClientOptions {
        return {
            endpoint: Endpoints.default,
            isCustomEndpoint: false,
            token: '',
            version: Version,
            beforeSendHooks: [],
            afterSendHooks: [],
        };
    }

    public runtime: IRuntimeEnvironment;
    public get version(): string {
        return libVersion;
    }
    private visitorId: string;
    private bufferedRequests: BufferedRequest[];
    private beforeSendHooks: AnalyticsClientSendEventHook[];
    private afterSendHooks: AnalyticsClientSendEventHook[];
    private eventTypeMapping: {[name: string]: EventTypeConfig};
    private options: ClientOptions;
    private acceptedLinkReferrers: string[] = [];

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

        const clientsOptions: IAnalyticsClientOptions = {
            baseUrl: this.baseUrl,
            token: this.options.token,
            visitorIdProvider: this,
            preprocessRequest: this.options.preprocessRequest,
        };

        if (doNotTrack()) {
            this.runtime = new NoopRuntime();
        } else {
            this.runtime = this.options.runtimeEnvironment || this.initRuntime(clientsOptions);
        }

        this.addEventTypeMapping(EventType.view, {newEventType: EventType.view, addClientIdParameter: true});
        this.addEventTypeMapping(EventType.click, {newEventType: EventType.click, addClientIdParameter: true});
        this.addEventTypeMapping(EventType.custom, {newEventType: EventType.custom, addClientIdParameter: true});
        this.addEventTypeMapping(EventType.search, {newEventType: EventType.search, addClientIdParameter: true});
    }

    private initRuntime(clientsOptions: IAnalyticsClientOptions) {
        if (hasWindow() && hasDocument()) {
            return new BrowserRuntime(clientsOptions, () => {
                const copy = [...this.bufferedRequests];
                this.bufferedRequests = [];
                return copy;
            });
        } else if (isReactNative()) {
            console.warn(ReactNativeRuntimeWarning);
        }
        return new NodeJSRuntime(clientsOptions);
    }

    private get storage() {
        return this.runtime.storage;
    }

    private async determineVisitorId() {
        try {
            return (
                (hasWindow() && this.extractClientIdFromLink(window.location.href)) ||
                (await this.storage.getItem('visitorId')) ||
                uuidv4()
            );
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

    async setClientId(value: string, namespace?: string) {
        if (uuidValidate(value)) {
            this.setCurrentVisitorId(value.toLowerCase());
        } else {
            if (!namespace) {
                throw Error('Cannot generate uuid client id without a specific namespace string.');
            }
            this.setCurrentVisitorId(uuidv5(value, uuidv5(namespace, COVEO_NAMESPACE)));
        }
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

    private extractClientIdFromLink(urlString: string): string | null {
        if (doNotTrack()) {
            return null;
        }
        try {
            const linkParam: string | null = new URL(urlString).searchParams.get(CoveoLinkParam.cvo_cid);
            if (linkParam == null) {
                return null;
            }
            const linker: CoveoLinkParam | null = CoveoLinkParam.fromString(linkParam);
            if (!linker || !hasDocument() || !linker.validate(document.referrer, this.acceptedLinkReferrers)) {
                return null;
            }
            return linker.clientId;
        } catch (error) {
            // Ignore any parsing errors
        }
        return null;
    }

    async resolveParameters(eventType: EventType | string, ...payload: VariableArgumentsPayload) {
        const {
            variableLengthArgumentsNames = [],
            addVisitorIdParameter = false,
            usesMeasurementProtocol = false,
            addClientIdParameter = false,
        } = this.eventTypeMapping[eventType] || {};

        const processVariableArgumentNamesStep: ProcessPayloadStep = (currentPayload) =>
            variableLengthArgumentsNames.length > 0
                ? this.parseVariableArgumentsPayload(variableLengthArgumentsNames, currentPayload)
                : currentPayload[0];
        const addVisitorIdStep: AsyncProcessPayloadStep = async (currentPayload) => ({
            ...currentPayload,
            visitorId: addVisitorIdParameter ? await this.getCurrentVisitorId() : '',
        });
        const addClientIdStep: AsyncProcessPayloadStep = async (currentPayload) => {
            if (addClientIdParameter) {
                return {
                    ...currentPayload,
                    clientId: await this.getCurrentVisitorId(),
                };
            }
            return currentPayload;
        };
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
            addClientIdStep,
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

        const addTrackingIdStep: ProcessPayloadStep = (currentPayload) =>
            this.setTrackingIdIfTrackingIdNotPresent(currentPayload);
        const cleanPayloadStep: ProcessPayloadStep = (currentPayload) =>
            this.removeEmptyPayloadValues(currentPayload, eventType);
        const validateParams: ProcessPayloadStep = (currentPayload) => this.validateParams(currentPayload, eventType);
        const processMeasurementProtocolConversionStep: ProcessPayloadStep = (currentPayload) =>
            usesMeasurementProtocol ? convertKeysToMeasurementProtocol(currentPayload) : currentPayload;
        const removeUnknownParameters: ProcessPayloadStep = (currentPayload) =>
            usesMeasurementProtocol ? this.removeUnknownParameters(currentPayload) : currentPayload;
        const processCustomParameters: ProcessPayloadStep = (currentPayload) =>
            usesMeasurementProtocol
                ? this.processCustomParameters(currentPayload)
                : this.mapCustomParametersToCustomData(currentPayload);

        const payloadToSend = await [
            addTrackingIdStep,
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

    async makeEvent<TPreparedRequest, TCompleteRequest, TResponse extends AnyEventResponse>(
        eventType: EventType | string,
        ...payload: VariableArgumentsPayload
    ): Promise<PreparedEvent<TPreparedRequest, TCompleteRequest, TResponse>> {
        const {newEventType: eventTypeToSend = eventType as EventType} = this.eventTypeMapping[eventType] || {};

        const parametersToSend = await this.resolveParameters(eventType, ...payload);
        const payloadToSend = await this.resolvePayloadForParameters(eventType, parametersToSend);
        return {
            eventType: eventTypeToSend,
            payload: payloadToSend,
            log: async (remainingPayload) => {
                this.bufferedRequests.push(<BufferedRequest>{
                    eventType: eventTypeToSend,
                    payload: {...payloadToSend, ...remainingPayload},
                });
                await Promise.all(
                    this.afterSendHooks.map((hook) => hook(eventType, {...parametersToSend, ...remainingPayload}))
                );
                await this.deferExecution();
                return (await this.sendFromBuffer()) as TResponse | void;
            },
        };
    }

    async sendEvent(eventType: EventType | string, ...payload: VariableArgumentsPayload) {
        return (await this.makeEvent<any, any, AnyEventResponse>(eventType, ...payload)).log({});
    }

    private deferExecution(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, 0));
    }

    private async sendFromBuffer(): Promise<AnyEventResponse | void> {
        const popped = this.bufferedRequests.shift();
        if (popped) {
            const {eventType, payload} = popped;
            return this.runtime.getClientDependingOnEventType(eventType).sendEvent(eventType, payload);
        }
    }

    public clear() {
        this.storage.removeItem('visitorId');
        const store = new HistoryStore();
        store.clear();
    }

    public deleteHttpOnlyVisitorId() {
        this.runtime.client.deleteHttpCookieVisitorId();
    }

    async makeSearchEvent(request: PreparedSearchEventRequest) {
        return this.makeEvent<PreparedSearchEventRequest, SearchEventRequest, SearchEventResponse>(
            EventType.search,
            request
        );
    }

    async sendSearchEvent({searchQueryUid, ...preparedRequest}: SearchEventRequest) {
        return (await this.makeSearchEvent(preparedRequest)).log({searchQueryUid});
    }

    async makeClickEvent(request: PreparedClickEventRequest) {
        return this.makeEvent<PreparedClickEventRequest, ClickEventRequest, ClickEventResponse>(
            EventType.click,
            request
        );
    }

    async sendClickEvent({searchQueryUid, ...preparedRequest}: ClickEventRequest) {
        return (await this.makeClickEvent(preparedRequest)).log({searchQueryUid});
    }

    async makeCustomEvent(request: PreparedCustomEventRequest) {
        return this.makeEvent<PreparedCustomEventRequest, CustomEventRequest, CustomEventResponse>(
            EventType.custom,
            request
        );
    }

    async sendCustomEvent({lastSearchQueryUid, ...preparedRequest}: CustomEventRequest) {
        return (await this.makeCustomEvent(preparedRequest)).log({lastSearchQueryUid});
    }

    async makeViewEvent(request: PreparedViewEventRequest) {
        return this.makeEvent<PreparedViewEventRequest, ViewEventRequest, ViewEventResponse>(EventType.view, request);
    }

    async sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse | void> {
        return (await this.makeViewEvent(request)).log({});
    }

    async getVisit(): Promise<VisitResponse> {
        // deepcode ignore Ssrf: url is supplied by script owner
        const response = await fetch(`${this.baseUrl}/analytics/visit`);
        const visit = (await response.json()) as VisitResponse;
        this.visitorId = visit.visitorId;
        return visit;
    }

    async getHealth(): Promise<HealthResponse> {
        // deepcode ignore Ssrf: url is supplied by script owner
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

    setAcceptedLinkReferrers(hosts: string[]): void {
        if (Array.isArray(hosts) && hosts.every((host) => typeof host == 'string')) this.acceptedLinkReferrers = hosts;
        else throw Error('Parameter should be an array of domain strings');
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
        let lowercasedCustom = {};
        if (custom && isObject(custom)) {
            lowercasedCustom = this.lowercaseKeys(custom);
        }

        const newPayload = convertCustomMeasurementProtocolKeys(rest);

        return {
            ...lowercasedCustom,
            ...newPayload,
        };
    }

    private mapCustomParametersToCustomData(payload: IRequestPayload): IRequestPayload {
        const {custom, ...rest} = payload;
        if (custom && isObject(custom)) {
            const lowercasedCustom = this.lowercaseKeys(custom);
            return {...rest, customData: {...lowercasedCustom, ...payload.customData}};
        } else {
            return payload;
        }
    }

    private lowercaseKeys(custom: Record<string, unknown>) {
        const keys = Object.keys(custom);
        let result: Record<string, unknown> = {};
        keys.forEach((key) => {
            result[key.toLowerCase() as string] = custom[key];
        });
        return result;
    }

    private validateParams(payload: IRequestPayload, eventType: EventType | string): IRequestPayload {
        const {anonymizeIp, ...rest} = payload;
        if (anonymizeIp !== undefined) {
            if (['0', 'false', 'undefined', 'null', '{}', '[]', ''].indexOf(`${anonymizeIp}`.toLowerCase()) == -1) {
                rest.anonymizeIp = 1;
            }
        }

        if (
            eventType == EventType.view ||
            eventType == EventType.click ||
            eventType == EventType.search ||
            eventType == EventType.custom
        ) {
            rest.originLevel3 = this.limit(rest.originLevel3, 128);
        }
        if (eventType == EventType.view) {
            rest.location = this.limit(rest.location, 128);
        }
        if (eventType == 'pageview' || eventType == 'event') {
            rest.referrer = this.limit(rest.referrer, 2048);
            rest.location = this.limit(rest.location, 2048);
            rest.page = this.limit(rest.page, 2048);
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

    private setTrackingIdIfTrackingIdNotPresent(payload: IRequestPayload): IRequestPayload {
        const {trackingId, ...rest} = payload;
        if (trackingId) {
            return payload;
        }

        if (rest.hasOwnProperty('custom') && isObject(rest.custom)) {
            if (rest.custom.hasOwnProperty('context_website') || rest.custom.hasOwnProperty('siteName')) {
                rest['trackingId'] = rest.custom.context_website || rest.custom.siteName;
            }
        }

        if (rest.hasOwnProperty('customData') && isObject(rest.customData)) {
            if (rest.customData.hasOwnProperty('context_website') || rest.customData.hasOwnProperty('siteName')) {
                rest['trackingId'] = rest.customData.context_website || rest.customData.siteName;
            }
        }

        return rest;
    }

    private limit(input: string, length: number): string | undefined | null {
        if (typeof input !== 'string') {
            return input;
        }
        return input.substring(0, length);
    }

    private get baseUrl(): string {
        return buildBaseUrl(this.options.endpoint, this.options.version, this.options.isCustomEndpoint);
    }
}

export default CoveoAnalyticsClient;
