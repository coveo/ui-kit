import {defineCustomElements as originalDefineCustomElements} from './_loader.js';

const defineCustomElements = function (...args) {
  import('../atomic/autoloader/index.esm.js');
  originalDefineCustomElements(...args);
};

export * from './_loader.js';
export * from './version.js';
export {defineCustomElements};
