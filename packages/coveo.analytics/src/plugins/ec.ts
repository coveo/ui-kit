import { AnalyticsClient } from '../client/analytics';
import { Params, Product } from '../coveoua/params';
import { EventType } from '../events';

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

export const ECPluginEventTypes = {
    pageview: 'pageview'
};

export class EC {
    private client: AnalyticsClient;
    private params: Params;
    constructor({  client, params }: { client: AnalyticsClient;  params: Params; }) {
        this.client = client;
        this.params = params;

        this.client.addEventTypeMapping(ECPluginEventTypes.pageview, EventType.collect);
        this.client.registerBeforeSendEventHook((eventType, payload) => {
            return eventType === ECPluginEventTypes.pageview
                ? this.enhancePayload(payload)
                : payload;
        });
    }

    addProduct(product: Product) {
        this.params.products = [...this.params.products, product];
    }

    private enhancePayload(payload: any) {
        return this.params.products.reduce((newPayload, product, index) => {
            return {
                ...newPayload,
                ...this.convertProductToMeasurementProtocol(product, index),
            };
        }, payload);
    }

    private convertProductToMeasurementProtocol(product: Product, index: number) {
        return Object.keys(product).reduce((mappedProduct, key) => {
            const newKey = `pr${index}${productKeysMapping[key] || key}`;
            return {
                ...mappedProduct,
                [newKey]: product[key]
            };
        }, {});
    }
}
