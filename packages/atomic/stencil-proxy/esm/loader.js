import searchComponents from '../atomic/components/components/search/lazy-index.js';
import {defineCustomElements as originalDefineCustomElements} from './_loader.js';

const defineCustomElements = function (...args) {
  Object.values(searchComponents).forEach((importFunction) => importFunction());
  originalDefineCustomElements(...args);
};

export * from './_loader.js';
export {defineCustomElements};
