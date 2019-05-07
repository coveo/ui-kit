import * as analytics from './library';
import handleOneAnalyticsEvent from './simpleanalytics';

declare const global: any;

// We need a custom trigger function for our Promise polyfill
// because the default one can cause issues in other frameworks that relies on
// their own Promise polyfill like the Salesforce Aura framework.
declare var require: any;
const promise = (window as any)['Promise'];
if (!(promise instanceof Function)) {
  require('es6-promise').polyfill();
}

// CoveoUAGlobal is the interface for the global function which also has a
// queue `q` of unexecuted parameters
export interface CoveoUAGlobal {
  (action: string, ...params: string[]): void;
  // CoveoAnalytics.q is the queue of last called actions before lib was included
  q?: string[][];
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
  coveoua.q.forEach((args: Array<string>) => handleOneAnalyticsEvent.apply(void 0, args));
}

export default coveoua;
