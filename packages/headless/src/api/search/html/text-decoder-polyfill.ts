// This polyfill is needed for Jest.
export const polyfillTextDecoder = () => {
  if (typeof window !== 'undefined') {
    return;
  }
  if (!global.TextDecoder) {
    const util = require('util');
    global.TextDecoder = util.TextDecoder;
  }
};
