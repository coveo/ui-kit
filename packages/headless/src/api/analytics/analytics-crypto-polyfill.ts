interface CryptoModuleInNode {
  getRandomValues?: typeof crypto.getRandomValues;
  webcrypto?: {getRandomValues: typeof crypto.getRandomValues};
}

const getGlobalCrypto = () => global.crypto as CryptoModuleInNode;

export const polyfill = () => {
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
