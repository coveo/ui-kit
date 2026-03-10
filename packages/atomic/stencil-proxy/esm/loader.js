import {registerAutoloader} from '../atomic/autoloader/index.esm.js';

const defineCustomElements = async (...args) => {
  const rootElementAutoloader = args.length > 2 ? args.pop() : undefined;
  registerAutoloader(rootElementAutoloader);
};

export * from './version.js';
export {defineCustomElements};
