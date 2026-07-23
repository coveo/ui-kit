import {Product, ImpressionList, BaseImpression} from '../../plugins/ec';
import {keysOf} from '../utils';

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
    // Below are keys that were extended for Coveo
    group: 'group',
};

const impressionKeysMapping: {[key in keyof BaseImpression]: string} = {
    id: 'id',
    name: 'nm',
    brand: 'br',
    category: 'ca',
    variant: 'va',
    position: 'ps',
    price: 'pr',
    // Below are keys that were extended for Coveo
    group: 'group',
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

// These extension keys do not have direct mappings, we are sending them as-is, thus only requiring an array.
const coveoCommerceExtensionKeys: string[] = [
    'loyaltyCardId',
    'loyaltyTier',
    'thirdPartyPersona',
    'companyName',
    'favoriteStore',
    'storeName',
    'userIndustry',
    'userRole',
    'userDepartment',
    'businessUnit',
];

const quoteActionsKeysMapping: {[name: string]: string} = {
    id: 'quoteId',
    affiliation: 'quoteAffiliation',
};

const reviewActionsKeysMapping: {[name: string]: string} = {
    id: 'reviewId',
    rating: 'reviewRating',
    comment: 'reviewComment',
};

export const commerceActionKeysMappingPerAction: Record<string, {[name: string]: string}> = {
    add: productActionsKeysMapping,
    bookmark_add: productActionsKeysMapping,
    bookmark_remove: productActionsKeysMapping,
    click: productActionsKeysMapping,
    checkout: productActionsKeysMapping,
    checkout_option: productActionsKeysMapping,
    detail: productActionsKeysMapping,
    impression: productActionsKeysMapping,
    remove: productActionsKeysMapping,
    refund: {
        ...productActionsKeysMapping,
        ...transactionActionsKeysMapping,
    },
    purchase: {
        ...productActionsKeysMapping,
        ...transactionActionsKeysMapping,
    },
    quickview: productActionsKeysMapping,
    quote: {
        ...productActionsKeysMapping,
        ...quoteActionsKeysMapping,
    },
    review: {
        ...productActionsKeysMapping,
        ...reviewActionsKeysMapping,
    },
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

const productKeysMappingValues = keysOf(productKeysMapping).map((key) => productKeysMapping[key]);
const impressionKeysMappingValues = keysOf(impressionKeysMapping).map((key) => impressionKeysMapping[key]);
const productActionsKeysMappingValues = keysOf(productActionsKeysMapping).map((key) => productActionsKeysMapping[key]);
const transactionActionsKeysMappingValues = keysOf(transactionActionsKeysMapping).map(
    (key) => transactionActionsKeysMapping[key]
);
const reviewKeysMappingValues = keysOf(reviewActionsKeysMapping).map((key) => reviewActionsKeysMapping[key]);
const quoteKeysMappingValues = keysOf(quoteActionsKeysMapping).map((key) => quoteActionsKeysMapping[key]);

const productSubKeysMatchGroup = [...productKeysMappingValues, 'custom'].join('|');
const impressionSubKeysMatchGroup = [...impressionKeysMappingValues, 'custom'].join('|');
const productPrefixMatchGroup = '(pr[0-9]+)';
const impressionPrefixMatchGroup = '(il[0-9]+pi[0-9]+)';
const productKeyRegex = new RegExp(`^${productPrefixMatchGroup}(${productSubKeysMatchGroup})$`);
const impressionKeyRegex = new RegExp(`^(${impressionPrefixMatchGroup}(${impressionSubKeysMatchGroup}))|(il[0-9]+nm)$`);
const productActionsKeyRegex = new RegExp(`^(${productActionsKeysMappingValues.join('|')})$`);
const transactionActionsKeyRegex = new RegExp(`^(${transactionActionsKeysMappingValues.join('|')})$`);
const customProductKeyRegex = new RegExp(`^${productPrefixMatchGroup}custom$`);
const customImpressionKeyRegex = new RegExp(`^${impressionPrefixMatchGroup}custom$`);
const coveoCommerceExtensionKeysRegex = new RegExp(
    `^(${[...coveoCommerceExtensionKeys, ...reviewKeysMappingValues, ...quoteKeysMappingValues].join('|')})$`
);

const isProductKey = (key: string) => productKeyRegex.test(key);
const isImpressionKey = (key: string) => impressionKeyRegex.test(key);
const isProductActionsKey = (key: string) => productActionsKeyRegex.test(key);
const isTransactionActionsKeyRegex = (key: string) => transactionActionsKeyRegex.test(key);
const isCoveoCommerceExtensionKey = (key: string) => coveoCommerceExtensionKeysRegex.test(key);

export const isCommerceKey = [
    isImpressionKey,
    isProductKey,
    isProductActionsKey,
    isTransactionActionsKeyRegex,
    isCoveoCommerceExtensionKey,
];
export const isCustomCommerceKey = [customProductKeyRegex, customImpressionKeyRegex];
