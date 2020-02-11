import { AnalyticsClient } from '../client/analytics';
import { EventType } from '../events';
import { uuidv4 } from '../client/crypto';
import { getFormattedLocation } from '../client/location';

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
    page: 'dp',
    visitorId: 'cid',
    clientId: 'cid',
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

export type DefaultContextInformation = ReturnType<typeof EC.prototype.getDefaultContextInformation> & ReturnType<typeof EC.prototype.getLocationInformation>;
const contextInformationMapping: {[key in keyof DefaultContextInformation]: string} = {
    hitType: 't',
    pageViewId: 'a',
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
    private lastLocation: string;
    private lastReferrer: string;

    constructor({ client, uuidGenerator = uuidv4 }: { client: AnalyticsClient, uuidGenerator?: typeof uuidv4 }) {
        this.client = client;
        this.uuidGenerator = uuidGenerator;
        this.pageViewId = uuidGenerator();
        this.lastLocation = getFormattedLocation(window.location);
        this.lastReferrer = document.referrer;

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
            addVisitorIdParameter: true,
        });
    }

    private addHooksForEvent() {
        this.client.addEventTypeMapping(ECPluginEventTypes.event, {
            newEventType: EventType.collect,
            variableLengthArgumentsNames: ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'],
            addVisitorIdParameter: true,
        });
    }

    private addECDataToPayload(eventType: string, payload: any) {
        const payloadWithConvertedKeys = this.convertKeysToMeasurementProtocol({
            ...(this.getLocationInformation(eventType, payload)),
            ...(this.getDefaultContextInformation(eventType)),
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

    private updateStateForNewPageView(payload: any) {
        if (this.hasSentFirstPageView) {
            this.pageViewId = this.uuidGenerator();
            this.lastReferrer = this.lastLocation;
        }

        if (!!payload.page) {
            const removeStartingSlash = (page: string) => page.replace(/^\/?(.*)$/, '/$1');
            const extractHostnamePart = (location: string) => location.split('/').slice(0, 3).join('/');
            this.lastLocation = `${extractHostnamePart(this.lastLocation)}${removeStartingSlash(payload.page)}`;
        } else {
            this.lastLocation = getFormattedLocation(window.location);
        }

        this.hasSentFirstPageView = true;
    }

    getLocationInformation(eventType: string, payload: any) {
        eventType === ECPluginEventTypes.pageview && this.updateStateForNewPageView(payload);
        return {
            referrer: this.lastReferrer,
            location: this.lastLocation,
        };
    }

    getDefaultContextInformation(eventType: string) {
        const pageContext = {
            hitType: eventType,
            pageViewId: this.pageViewId
        };
        const documentContext = {
            title: document.title,
            encoding: document.characterSet,
        };
        const screenContext = {
            screenResolution: `${screen.width}x${screen.height}`,
            screenColor: `${screen.colorDepth}-bit`,
        };
        const navigatorContext = {
            language: navigator.language,
            userAgent: navigator.userAgent,
        };
        const eventContext = {
            time: Date.now().toString(),
            eventId: this.uuidGenerator(),
        };
        return {
            ...pageContext,
            ...eventContext,
            ...screenContext,
            ...navigatorContext,
            ...documentContext
        };
    }
}
