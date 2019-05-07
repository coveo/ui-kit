import * as analytics from './library';
import handleOneAnalyticsEvent from './simpleanalytics';

declare const global: any;

const promise = (window as any)['Promise'];
if (!(promise instanceof Function)) {
    console.error(`This script uses window.Promise which is not supported in your browser. Consider adding a polyfill like "es6-promise".`);
}
const fetch = (window as any)['fetch'];
if (!(fetch instanceof Function)) {
    console.error(`This script uses window.fetch which is not supported in your browser. Consider adding a polyfill like "fetch".`);
}

// CoveoUAGlobal is the interface for the global function which also has a
// queue `q` of unexecuted parameters
export interface CoveoUAGlobal {
    (action: string, ...params: string[]): void;
    // CoveoAnalytics.q is the queue of last called actions before lib was included
    q?: [string, any[]][];
}

// On load of this script we get the global object `coveoua` (which would be)
// on `window` in a browser
const coveoua: CoveoUAGlobal = global.coveoua || {};

// Replace the quick shim with the real thing.
global.coveoua = handleOneAnalyticsEvent;

global.coveoanalytics = analytics;

// On normal execution this library should be loaded after the snippet execution
// so we will execute the actions in the `q` array
if (coveoua.q) {
    coveoua.q.forEach((args: [string, any[]]) => handleOneAnalyticsEvent.apply(void 0, args));
}

export default coveoua;
