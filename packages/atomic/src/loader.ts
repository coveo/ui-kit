import {registerAutoloader} from './autoloader/index.js';

export const defineCustomElements = async (...args: unknown[]) => {
  const rootElementAutoloader = args.length > 2 ? args.pop() : undefined;
  registerAutoloader(
    rootElementAutoloader as Element | ShadowRoot | DocumentFragment
  );
};
/**
 * @deprecated The applyPolyfills function has been removed. It always been a no-op, and should not be used.
 */
export const applyPolyfills = () => {
  throw new Error(
    'The applyPolyfills function has been removed. It always been a no-op, and should not be used.'
  );
};
/**
 * @deprecated Since v3.52.0, `@coveo/atomic` does not longer add script or style tags. The setNonce function is now a no-op and can be safely removed from your codebase.
 */
export const setNonce = () => {
  console.warn(
    'Since v3.52.0, `@coveo/atomic` does not longer add script or style tags. The setNonce function is now a no-op and can be safely removed from your codebase.'
  );
};

export * from './versions.js';
