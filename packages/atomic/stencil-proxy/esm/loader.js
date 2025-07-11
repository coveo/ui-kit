import {registerAutoloader} from '../atomic/autoloader/index.esm.js';
import {defineCustomElements as stencilDefineCustomElements} from './_loader.js';

const defineCustomElements = async (...args) => {
  const rootElementAutoloader = args.length > 2 ? args.pop() : undefined;
  registerAutoloader(rootElementAutoloader);
  stencilDefineCustomElements(...args);
};

export * from './_loader.js';
export * from './version.js';
export {defineCustomElements};
