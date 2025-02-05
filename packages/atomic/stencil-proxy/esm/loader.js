import commerceComponents from '../atomic/components/components/commerce/lazy-index.js';
import insightComponents from '../atomic/components/components/insight/lazy-index.js';
import ipxComponents from '../atomic/components/components/ipx/lazy-index.js';
import recommendationsComponents from '../atomic/components/components/recommendations/lazy-index.js';
import searchComponents from '../atomic/components/components/search/lazy-index.js';
import {defineCustomElements as originalDefineCustomElements} from './_loader.js';

const defineCustomElements = function (...args) {
  Object.values({
    ...recommendationsComponents,
    ...ipxComponents,
    ...insightComponents,
    ...commerceComponents,
    ...searchComponents,
  }).forEach((importFunction) => importFunction());
  originalDefineCustomElements(...args);
};

export * from './_loader.js';
export {defineCustomElements};
