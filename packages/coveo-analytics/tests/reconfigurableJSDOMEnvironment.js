const {TestEnvironment} = require('jest-environment-jsdom');

class ReconfigurableJSDOMEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    this.global.reconfigureJSDOM = (options) => this.dom.reconfigure(options);
  }
}

module.exports = ReconfigurableJSDOMEnvironment;
