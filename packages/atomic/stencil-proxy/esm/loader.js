import commerceComponents from '../atomic/components/components/commerce/lazy-index.js';
import searchComponents from '../atomic/components/components/search/lazy-index.js';
import {defineCustomElements as originalDefineCustomElements} from './_loader.js';

const defineCustomElements = function (...args) {
  Object.values({...searchComponents, ...commerceComponents}).forEach(
    (importFunction) => importFunction()
  );
  originalDefineCustomElements(...args);
};

export * from './_loader.js';
export {defineCustomElements};
