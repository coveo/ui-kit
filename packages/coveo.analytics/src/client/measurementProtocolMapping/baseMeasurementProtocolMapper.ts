import {BasePlugin} from '../../plugins/BasePlugin';

type DefaultContextInformation = ReturnType<typeof BasePlugin.prototype.getDefaultContextInformation> &
    ReturnType<typeof BasePlugin.prototype.getLocationInformation>;

const globalParamKeysMapping: {[name: string]: string} = {
    anonymizeIp: 'aip',
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

/* Those are extension keys that are supported by the Coveo collect protocol (but not Google's protocol). They will be forwarded as-is. */
const coveoExtensionsKeys = [
    'contentId',
    'contentIdKey',
    'contentType',
    'searchHub',
    'tab',
    'searchUid',
    'permanentId',
    'contentLocale',
    'trackingId',
];

export const baseMeasurementProtocolKeysMapping: {[name: string]: string} = {
    ...globalParamKeysMapping,
    ...eventKeysMapping,
    ...contextInformationMapping,
    ...coveoExtensionsKeys.reduce(
        (all, key) => ({
            ...all,
            [key]: key,
        }),
        {}
    ),
};
