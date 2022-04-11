const Environment = require('jest-environment-jsdom');

module.exports = class CustomTestEnvironment extends Environment {
  async setup() {
    await super.setup();
    if (
      typeof this.global.TextEncoder === 'undefined' &&
      typeof this.global.TextDecoder === 'undefined'
    ) {
      const {TextEncoder, TextDecoder} = require('util');
      this.global.TextEncoder = TextEncoder;
      this.global.TextDecoder = TextDecoder;
    }
  }
};
