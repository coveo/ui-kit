import {registerAutoloader} from '../atomic/autoloader/index.esm.js';

const defineCustomElements = (...args) => {
  const rootElementAutoloader = args.length > 2 ? args.pop() : undefined;
  registerAutoloader(rootElementAutoloader);
};

const applyPolyfills = () => {
  throw new Error('The applyPolyfills function has been removed. It has always been a no-op and should not be used.');
};
const setNonce = () => {
  console.warn('Since v3.52.0, `@coveo/atomic` no longer adds script or style tags. The setNonce function is now a no-op and can be safely removed from your codebase.');
};

export * from './version.js';
export {defineCustomElements, applyPolyfills, setNonce};
