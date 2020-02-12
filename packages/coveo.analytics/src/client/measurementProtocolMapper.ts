import { EC, Product } from '../plugins/ec';

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
    userId: 'uid'
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

type DefaultContextInformation = ReturnType<typeof EC.prototype.getDefaultContextInformation> & ReturnType<typeof EC.prototype.getLocationInformation>;
const contextInformationMapping: {[key in keyof DefaultContextInformation]: string} = {
    hitType: 't',
    pageViewId: 'pid',
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

export const convertKeysToMeasurementProtocol = (params: any) => {
    return Object.keys(params).reduce((mappedKeys, key) => {
        const newKey = measurementProtocolKeysMapping[key] || key;
        return {
            ...mappedKeys,
            [newKey]: params[key],
        };
    }, {});
};

export const convertProductToMeasurementProtocol = (product: Product, index: number) => {
    return Object.keys(product).reduce((mappedProduct, key) => {
        const newKey = `pr${index + 1}${productKeysMapping[key] || key}`;
        return {
            ...mappedProduct,
            [newKey]: product[key]
        };
    }, {});
};
