const Environment = require('jest-environment-jsdom');

/**
 * A custom environment to set the TextEncoder that is required by TensorFlow.js.
 */
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
