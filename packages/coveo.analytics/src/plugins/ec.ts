import {AnalyticsClient} from '../client/analytics';
import {EventType} from '../events';
import {uuidv4} from '../client/crypto';
import {getFormattedLocation} from '../client/location';
import {
    convertProductToMeasurementProtocol,
    convertImpressionListToMeasurementProtocol,
} from '../client/measurementProtocolMapper';

export const ECPluginEventTypes = {
    pageview: 'pageview',
    event: 'event',
};

const allECEventTypes = Object.keys(ECPluginEventTypes).map(
    (key) => ECPluginEventTypes[key as keyof typeof ECPluginEventTypes]
);

// From https://stackoverflow.com/a/49725198/497731
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

export interface ProductProperties {
    id?: string;
    name?: string;
    brand?: string;
    category?: string;
    variant?: string;
    price?: number;
    quantity?: number;
    coupon?: string;
    position?: number;
}

export type Product = RequireAtLeastOne<ProductProperties, 'id' | 'name'>;

export interface ImpressionProperties {
    id?: string;
    name?: string;
    list?: string;
    brand?: string;
    category?: string;
    variant?: string;
    position?: number;
    price?: number;
}

export type Impression = RequireAtLeastOne<ImpressionProperties, 'id' | 'name'>;
export type BaseImpression = Omit<Impression, 'list'>;
export interface ImpressionList {
    listName?: string;
    impressions: BaseImpression[];
}

export class EC {
    private client: AnalyticsClient;
    private uuidGenerator: typeof uuidv4;
    private products: Product[] = [];
    private impressions: Impression[] = [];
    private action?: string;
    private actionData: {[name: string]: string} = {};
    private pageViewId: string;
    private hasSentFirstPageView?: boolean;
    private lastLocation: string;
    private lastReferrer: string;

    constructor({client, uuidGenerator = uuidv4}: {client: AnalyticsClient; uuidGenerator?: typeof uuidv4}) {
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

    addImpression(impression: Impression) {
        this.impressions.push(impression);
    }

    setAction(action: string, options?: any) {
        this.action = action;
        this.actionData = options;
    }

    clearData() {
        this.products = [];
        this.impressions = [];
        this.action = undefined;
        this.actionData = {};
    }

    private addHooksForECEvents() {
        this.client.registerBeforeSendEventHook((eventType, ...[payload]) => {
            return allECEventTypes.indexOf(eventType) !== -1 ? this.addECDataToPayload(eventType, payload) : payload;
        });
    }

    private addHooksForPageView() {
        this.client.addEventTypeMapping(ECPluginEventTypes.pageview, {
            newEventType: EventType.collect,
            variableLengthArgumentsNames: ['page'],
            addVisitorIdParameter: true,
            usesMeasurementProtocol: true,
        });
    }

    private addHooksForEvent() {
        this.client.addEventTypeMapping(ECPluginEventTypes.event, {
            newEventType: EventType.collect,
            variableLengthArgumentsNames: ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'],
            addVisitorIdParameter: true,
            usesMeasurementProtocol: true,
        });
    }

    private addECDataToPayload(eventType: string, payload: any) {
        const ecPayload = {
            ...this.getLocationInformation(eventType, payload),
            ...this.getDefaultContextInformation(eventType),
            ...(this.action ? {action: this.action} : {}),
            ...(this.actionData || {}),
        };

        const productPayload = this.products.reduce((newPayload, product, index) => {
            return {
                ...newPayload,
                ...convertProductToMeasurementProtocol(product, index),
            };
        }, {});

        const impressionsByList = this.getImpressionsByList();
        const impressionPayload = impressionsByList.reduce((newPayload, impressionList, index) => {
            return {
                ...newPayload,
                ...convertImpressionListToMeasurementProtocol(impressionList, index),
            };
        }, {});

        this.clearData();

        return {
            ...impressionPayload,
            ...productPayload,
            ...ecPayload,
            ...payload,
        };
    }

    private getImpressionsByList() {
        return this.impressions.reduce((lists, impression) => {
            const {list: listName, ...baseImpression} = impression;
            const list = lists.find((list) => list.listName === listName);
            if (list) {
                list.impressions.push(baseImpression);
            } else {
                lists.push({listName: listName, impressions: [baseImpression]});
            }
            return lists;
        }, [] as ImpressionList[]);
    }

    private updateStateForNewPageView(payload: any) {
        if (this.hasSentFirstPageView) {
            this.pageViewId = this.uuidGenerator();
            this.lastReferrer = this.lastLocation;
        }

        if (!!payload.page) {
            const removeStartingSlash = (page: string) => page.replace(/^\/?(.*)$/, '/$1');
            const extractHostnamePart = (location: string) =>
                location
                    .split('/')
                    .slice(0, 3)
                    .join('/');
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
            pageViewId: this.pageViewId,
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
            ...documentContext,
        };
    }
}
