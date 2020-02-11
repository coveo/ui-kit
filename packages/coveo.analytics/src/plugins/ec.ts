import { AnalyticsClient, DefaultContextInformation } from '../client/analytics';
import { EventType } from '../events';
import { uuidv4 } from '../client/crypto';

// Based off: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#enhanced-ecomm
const productKeysMapping: {[name: string]: string} = {
    id: 'id',
    name: 'nm',
    brand: 'br',
    category: 'ca',
    variant: 'va',
    position: 'ps',
    price: 'pr',
    quantity: 'qt',
    coupon: 'cc'
};

const eventKeysMapping: {[name: string]: string} = {
    eventCategory: 'ec',
    eventAction: 'ea',
    eventLabel: 'el',
    eventValue: 'ev',
    pageViewId: 'a',
    hitType: 't',
};

const productActionsKeysMapping: {[name: string]: string} = {
    action: 'pa',
    list: 'pal',
    listSource: 'pls'
};

const transactionActionsKeysMappings: {[name: string]: string} = {
    id: 'ti',
    revenue: 'tr',
    tax: 'tt',
    shipping: 'ts',
    coupon: 'tcc',
    affiliation: 'ta',
    step: 'cos',
    option: 'col'
};

const contextInformationMapping: {[key in keyof DefaultContextInformation]: string} = {
    clientId: 'cid',
    encoding: 'de',
    location: 'dl',
    referrer: 'dr',
    screenColor: 'sd',
    screenResolution: 'sr',
    title: 'dt',
    userAgent: 'ua',
    language: 'ul',
    eventId: 'z',
    time: 'tm',
};

const measurementProtocolKeysMapping: {[name: string]: string} = {
    ...eventKeysMapping,
    ...productActionsKeysMapping,
    ...transactionActionsKeysMappings,
    ...contextInformationMapping
};

export const ECPluginEventTypes = {
    pageview: 'pageview',
    event: 'event'
};

const allECEventTypes = Object.keys(ECPluginEventTypes).map(key => ECPluginEventTypes[key as keyof typeof ECPluginEventTypes]);

export interface Product {
    [name: string]: string;
}

export class EC {
    private client: AnalyticsClient;
    private uuidGenerator: typeof uuidv4;
    private products: Product[] = [];
    private action?: string;
    private actionData: {[name: string]: string} = {};
    private pageViewId: string;
    private hasSentFirstPageView?: boolean;

    constructor({ client, uuidGenerator = uuidv4 }: { client: AnalyticsClient, uuidGenerator?: typeof uuidv4 }) {
        this.client = client;
        this.uuidGenerator = uuidGenerator;
        this.pageViewId = uuidGenerator();

        this.addHooksForPageView();
        this.addHooksForEvent();
        this.addHooksForECEvents();
    }

    addProduct(product: Product) {
        this.products.push(product);
    }

    setAction(action: string, options?: any) {
        this.action = action;
        this.actionData = options;
    }

    clearData() {
        this.products = [];
        this.action = undefined;
        this.actionData = {};
    }

    private addHooksForECEvents() {
        this.client.registerBeforeSendEventHook((eventType, ...[payload]) => {
            return allECEventTypes.indexOf(eventType) !== -1
                ? this.addECDataToPayload(eventType, payload)
                : payload;
        });
    }

    private addHooksForPageView() {
        this.client.addEventTypeMapping(ECPluginEventTypes.pageview, {
            newEventType: EventType.collect,
            variableLengthArgumentsNames: ['page'],
            addDefaultContextInformation: true,
        });
    }

    private addHooksForEvent() {
        this.client.addEventTypeMapping(ECPluginEventTypes.event, {
            newEventType: EventType.collect,
            variableLengthArgumentsNames: ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'],
            addDefaultContextInformation: true,
        });
    }

    private addECDataToPayload(eventType: string, payload: any) {
        const payloadWithConvertedKeys = this.convertKeysToMeasurementProtocol({
            hitType: eventType,
            pageViewId: this.getPageViewId(eventType),
            ...(this.action ? { action: this.action } : {}),
            ...(this.actionData || {}),
            ...payload
        });

        const productPayload = this.products.reduce((newPayload, product, index) => {
            return {
                ...newPayload,
                ...this.convertProductToMeasurementProtocol(product, index),
            };
        }, {});

        this.clearData();

        return {
            ...productPayload,
            ...payloadWithConvertedKeys,
        };
    }

    private convertKeysToMeasurementProtocol(params: any) {
        return Object.keys(params).reduce((mappedKeys, key) => {
            const newKey = measurementProtocolKeysMapping[key] || key;
            return {
                ...mappedKeys,
                [newKey]: params[key],
            };
        }, {});
    }

    private convertProductToMeasurementProtocol(product: Product, index: number) {
        return Object.keys(product).reduce((mappedProduct, key) => {
            const newKey = `pr${index + 1}${productKeysMapping[key] || key}`;
            return {
                ...mappedProduct,
                [newKey]: product[key]
            };
        }, {});
    }

    private getPageViewId(eventType: string) {
        if (eventType === ECPluginEventTypes.pageview) {
            if (this.hasSentFirstPageView) {
                this.pageViewId = this.uuidGenerator();
            }
            this.hasSentFirstPageView = true;
        }
        return this.pageViewId;
    }
}
