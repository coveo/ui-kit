interface CryptoModuleInNode {
  getRandomValues?: typeof crypto.getRandomValues;
  webcrypto?: {getRandomValues: typeof crypto.getRandomValues};
}

const getGlobalCrypto = () => global.crypto as CryptoModuleInNode;

// This polyfill is needed for node environment below 20.
// This could be removed when Headless no longer needs to support NodeJS below that version;
export const polyfillCryptoNode = () => {
  if (typeof window !== 'undefined') {
    return;
  }
  if (!getGlobalCrypto()) {
    global.crypto = require('crypto');
  }

  if (!getGlobalCrypto().getRandomValues && getGlobalCrypto().webcrypto) {
    global.crypto.getRandomValues =
      getGlobalCrypto().webcrypto!.getRandomValues.bind(
        getGlobalCrypto().webcrypto
      );
  }
};
