import {registerAutoloader} from '../autoloader/index.js';

const defineCustomElements = async (...args: unknown[]) => {
  const rootElementAutoloader = args.length > 2 ? args.pop() : undefined;
  registerAutoloader(rootElementAutoloader as HTMLElement | undefined);
};

export * from './version.js';
export {defineCustomElements};
