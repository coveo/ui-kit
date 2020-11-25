import {EC, Product, ImpressionList, BaseImpression} from '../plugins/ec';
import {isTicketKey, svcActionsKeysMapping} from './coveoServiceMeasurementProtocolMapper';
import {keysOf} from './utils';

const globalParamKeysMapping: {[name: string]: string} = {
    anonymizeIp: 'aip',
};

// Based off: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#enhanced-ecomm
const productKeysMapping: {[key in keyof Product]: string} = {
    id: 'id',
    name: 'nm',
    brand: 'br',
    category: 'ca',
    variant: 'va',
    price: 'pr',
    quantity: 'qt',
    coupon: 'cc',
    position: 'ps',
};

const impressionKeysMapping: {[key in keyof BaseImpression]: string} = {
    id: 'id',
    name: 'nm',
    brand: 'br',
    category: 'ca',
    variant: 'va',
    position: 'ps',
    price: 'pr',
};

const eventKeysMapping: {[name: string]: string} = {
    eventCategory: 'ec',
    eventAction: 'ea',
    eventLabel: 'el',
    eventValue: 'ev',
    page: 'dp',
    visitorId: 'cid',
    clientId: 'cid',
    userId: 'uid',
    currencyCode: 'cu',
};

const productActionsKeysMapping: {[name: string]: string} = {
    action: 'pa',
    list: 'pal',
    listSource: 'pls',
};

const transactionActionsKeysMapping: {[name: string]: string} = {
    id: 'ti',
    revenue: 'tr',
    tax: 'tt',
    shipping: 'ts',
    coupon: 'tcc',
    affiliation: 'ta',
    step: 'cos',
    option: 'col',
};

type DefaultContextInformation = ReturnType<typeof EC.prototype.getDefaultContextInformation> &
    ReturnType<typeof EC.prototype.getLocationInformation>;
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
    ...transactionActionsKeysMapping,
    ...contextInformationMapping,
    ...globalParamKeysMapping,
    ...svcActionsKeysMapping,
};

export const convertKeysToMeasurementProtocol = (params: any) => {
    return keysOf(params).reduce((mappedKeys, key) => {
        const newKey = measurementProtocolKeysMapping[key] || key;
        return {
            ...mappedKeys,
            [newKey]: params[key],
        };
    }, {});
};

export const convertProductToMeasurementProtocol = (product: Product, index: number) => {
    return keysOf(product).reduce((mappedProduct, key) => {
        const newKey = `pr${index + 1}${productKeysMapping[key] || key}`;
        return {
            ...mappedProduct,
            [newKey]: product[key],
        };
    }, {});
};

export const convertImpressionListToMeasurementProtocol = (
    impressionList: ImpressionList,
    listIndex: number,
    prefix: string
) => {
    const payload: {[name: string]: any} = impressionList.impressions.reduce(
        (mappedImpressions, impression, productIndex) => {
            return {
                ...mappedImpressions,
                ...convertImpressionToMeasurementProtocol(impression, listIndex, productIndex, prefix),
            };
        },
        {}
    );

    if (impressionList.listName) {
        const listNameKey = `il${listIndex + 1}nm`;
        payload[listNameKey] = impressionList.listName;
    }
    return payload;
};

const convertImpressionToMeasurementProtocol = (
    impression: BaseImpression,
    listIndex: number,
    productIndex: number,
    prefix: string
) => {
    return keysOf(impression).reduce((mappedImpression, key) => {
        const newKey = `il${listIndex + 1}${prefix}${productIndex + 1}${impressionKeysMapping[key] || key}`;
        return {
            ...mappedImpression,
            [newKey]: impression[key],
        };
    }, {});
};

const measurementProtocolKeysMappingValues = keysOf(measurementProtocolKeysMapping).map(
    (key) => measurementProtocolKeysMapping[key]
);
const productKeysMappingValues = keysOf(productKeysMapping).map((key) => productKeysMapping[key]);
const impressionKeysMappingValues = keysOf(impressionKeysMapping).map((key) => impressionKeysMapping[key]);

const productSubKeysMatchGroup = [...productKeysMappingValues, 'custom'].join('|');
const impressionSubKeysMatchGroup = [...impressionKeysMappingValues, 'custom'].join('|');
const productPrefixMatchGroup = '(pr[0-9]+)';
const impressionPrefixMatchGroup = '(il[0-9]+pi[0-9]+)';
const productKeyRegex = new RegExp(`^${productPrefixMatchGroup}(${productSubKeysMatchGroup})$`);
const impressionKeyRegex = new RegExp(`^(${impressionPrefixMatchGroup}(${impressionSubKeysMatchGroup}))|(il[0-9]+nm)$`);
const customProductKeyRegex = new RegExp(`^${productPrefixMatchGroup}custom$`);
const customImpressionKeyRegex = new RegExp(`^${impressionPrefixMatchGroup}custom$`);

const isProductKey = (key: string) => productKeyRegex.test(key);
const isImpressionKey = (key: string) => impressionKeyRegex.test(key);
const isKnownMeasurementProtocolKey = (key: string) => measurementProtocolKeysMappingValues.indexOf(key) !== -1;
const isCustomKey = (key: string) => key === 'custom';

export const isMeasurementProtocolKey = (key: string): boolean => {
    return [isProductKey, isTicketKey, isImpressionKey, isKnownMeasurementProtocolKey, isCustomKey].some((test) =>
        test(key)
    );
};

export const convertCustomMeasurementProtocolKeys = (data: {[name: string]: string | {[name: string]: string}}) => {
    return keysOf(data).reduce((all, current) => {
        const match = customProductKeyRegex.exec(current) || customImpressionKeyRegex.exec(current);
        if (match) {
            const originalKey = match[1];
            return {
                ...all,
                ...convertCustomObject(originalKey, data[current] as {[name: string]: string}),
            };
        } else {
            return {
                ...all,
                [current]: data[current],
            };
        }
    }, {});
};

const convertCustomObject = (prefix: string, customData: {[name: string]: string}) => {
    return keysOf(customData).reduce(
        (allCustom, currentCustomKey) => ({
            ...allCustom,
            [`${prefix}${currentCustomKey}`]: customData[currentCustomKey],
        }),
        {}
    );
};
