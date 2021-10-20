'use strict';

/**
 * Important: Cypress does not support custom reporters written in TypeScript.
 * See this issue for details: https://github.com/cypress-io/cypress/issues/8617
 */

const path = require('path');
const net = require('net');
const chalk = require('chalk');
const Mocha = require('mocha');

const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

/** @typedef {import('./detailed-collector').Message} Message */

class DetailedReporter {

  /**
   * 
   * @param {Mocha.Runner} runner 
   */
  constructor(runner) {
    const self = this;
    this._indent = 0;
    this._scopeIndent = 0;

    /** @type string[] */
    this._logBuffer = [];

    const server = net.createServer(function (socket) {
      socket.on('data', function (data) {

        self.handleCollectorMessage(self.parseCollectorMessage(data.toString()));
      })
      .on('error', function (error) {
        console.error(`Error on custom reporter socket. ${error}`);
      });
    });
    server.listen(path.join(process.cwd(), 'ipc.sock'));

    runner.once(EVENT_RUN_BEGIN, () => self.handleBeginRun())
    .on(EVENT_SUITE_BEGIN, (suite) => self.handleBeginSuite(suite))
    .on(EVENT_TEST_PASS, (test) => self.handlePassedTest(test))
    .on(EVENT_TEST_FAIL, (test, err) => self.handleFailedTest(test, err))
    .on(EVENT_SUITE_END, () => self.handleEndSuite())
    .once(EVENT_RUN_END, () => {
      self.handleEndRun();
      server.close();
    });
  }

  /**
   * 
   * @param {string} message 
   * @returns 
   */
  parseCollectorMessage(message) {
    try {
      return JSON.parse(message);
    } catch (err) {
      console.error(`Cannot parse data sent by the collector. ${err}`);
    }
  }

  /**
   * 
   * @param {Message} data 
   */
  handleCollectorMessage(data) {
    switch (data.type) {
      case 'scope:begin':
        this.handleBeginScope(data);
        break;
      case 'scope:end':
        this.handleEndScope();
        break;
      case 'expectation':
        this.handleExpectation(data);
        break;
      default:
        console.warn(`unknown collector message type: ${data.type}`);
        break;
    }
  }

  handleBeginRun() {
    this._indent++;
  }

  /**
   * 
   * @param {Mocha.Suite} suite 
   */
  handleBeginSuite(suite) {
    console.log(this.indent() + chalk.dim(suite.title));
    this._indent++;
  }

  /**
   * 
   * @param {Message} data 
   */
  handleBeginScope(data) {
    this._logBuffer.push(this.scopeIndent() + chalk.dim(data.content));
    this._scopeIndent++;
  }

  handleEndScope() {
    this._scopeIndent--;
  }

  /**
   * 
   * @param {Message} data 
   */
  handleExpectation(data) {
    this._logBuffer.push(this.scopeIndent() + chalk.green('. ') + chalk.dim(data.content));
  }

  /**
   * 
   * @param {Mocha.Test} test 
   */
  handlePassedTest(test) {
    console.log(this.indent() + chalk.green('✓ ') + test.title);
    this._logBuffer.splice(0).forEach((log) => {
      console.log(this.indent() + '  ' + log);
    });
  }

  /**
   * 
   * @param {Mocha.Test} test 
   * @param {Error} err 
   */
  handleFailedTest(test, err) {
    console.log(this.indent() + chalk.red('✗ ') + test.title);
    this._logBuffer.splice(0).forEach((log) => {
      console.log(this.indent() + '  ' + log);
    });

    console.log(`\nERROR:\n${err.stack}\n`);
  }

  handleEndSuite() {
    this._indent--;
    this._scopeIndent = 0;
  }

  handleEndRun() {
    this._indent = 0;
  }

  indent() {
    return '  '.repeat(this._indent);
  }

  scopeIndent() {
    return '  '.repeat(this._scopeIndent);
  }
}

module.exports = DetailedReporter;
