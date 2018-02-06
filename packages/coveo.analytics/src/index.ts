import * as analytics from './analytics';
import * as SimpleAnalytics from './simpleanalytics';
import * as history from './history';
import * as donottrack from './donottrack';
import * as storage from './storage';

declare var require: any;
const promise = (window as any)['Promise'];
if (!(promise instanceof Function)) {
  require('es6-promise').polyfill();
}

export {
    analytics,
    donottrack,
    history,
    SimpleAnalytics,
    storage
}
