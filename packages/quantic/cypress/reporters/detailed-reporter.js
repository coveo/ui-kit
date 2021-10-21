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
  EVENT_TEST_PENDING,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
} = Mocha.Runner.constants;

/** @typedef {import('./detailed-collector').Message} Message */

/**
 * The `DetailedReporter` class produces a detailed report listing
 * all expectations that are being validated.
 *
 *
 * Additional context is provided using the `scope` function.
 * Details on a particular expectation are logged using the `logDetail` custom Cypress command.
 * See `detailed-collector.ts` for more information.
 */
class DetailedReporter {
  /**
   * Creates a new instance of `DetailedReporter`.
   * @param {Mocha.Runner} runner
   */
  constructor(runner) {
    const self = this;
    this._isWindows = require('os').platform() === 'win32';

    this._indent = 0;
    this._scopeIndent = 0;

    /** @type string[] */
    this._logBuffer = [];

    const server = net.createServer(function (socket) {
      socket
        .on('data', function (data) {
          self.handleCollectorMessage(
            self.parseCollectorMessage(data.toString())
          );
        })
        .on('error', function (error) {
          console.error(`Error on custom reporter socket. ${error}`);
        });
    });
    server.listen(this.getServerPath());

    runner
      .once(EVENT_RUN_BEGIN, () => self.handleBeginRun())
      .on(EVENT_SUITE_BEGIN, (suite) => self.handleBeginSuite(suite))
      .on(EVENT_TEST_PASS, (test) => self.handlePassedTest(test))
      .on(EVENT_TEST_FAIL, (test, err) => self.handleFailedTest(test, err))
      .on(EVENT_TEST_PENDING, (test) => self.handlePendingTest(test))
      .on(EVENT_SUITE_END, () => self.handleEndSuite())
      .once(EVENT_RUN_END, () => {
        self.handleEndRun();
        server.close();
      });
  }

  getServerPath() {
    // on Windows, the server path must be a named pipe.
    // on other platforms, a file path is used to open a local socket.
    return this._isWindows
      ? '\\\\.\\pipe\\detailed-reporter'
      : path.join(process.cwd(), 'ipc.sock');
  }

  /**
   * Parses the JSON message received from the collector.
   * @param {string} jsonMessage The message containing the event sent from the test (e.g., scope begin, scope end, log expectation)
   * @returns {Message}
   */
  parseCollectorMessage(jsonMessage) {
    return JSON.parse(jsonMessage);
  }

  /**
   * Handles a message received from the collector.
   * @param {Message} message The message received from the collector.
   */
  handleCollectorMessage(message) {
    switch (message.type) {
      case 'scope:begin':
        this.handleBeginScope(message);
        break;
      case 'scope:end':
        this.handleEndScope();
        break;
      case 'expectation':
        this.handleExpectation(message);
        break;
      default:
        console.warn(`unknown collector message type: ${message.type}`);
        break;
    }
  }

  /**
   * Handles the `EVENT_RUN_BEGIN` event.
   */
  handleBeginRun() {
    this._indent++;
  }

  /**
   * Handles the `EVENT_SUITE_BEGIN` event.
   * @param {Mocha.Suite} suite The suite instance.
   */
  handleBeginSuite(suite) {
    console.log(this.indent() + chalk.dim(suite.title));
    this._indent++;
  }

  /**
   * Handles the `scope:begin` message.
   * @param {Message} message The message instance.
   */
  handleBeginScope(message) {
    this._logBuffer.push(this.scopeIndent() + chalk.dim(message.content));
    this._scopeIndent++;
  }

  /**
   * Handles the `scope:end` message.
   */
  handleEndScope() {
    this._scopeIndent--;
  }

  /**
   * Handles the `expectation` message.
   * @param {Message} message The message instance.
   */
  handleExpectation(message) {
    this._logBuffer.push(
      this.scopeIndent() + chalk.green('. ') + chalk.dim(message.content)
    );
  }

  /**
   * Handles the `EVENT_TEST_PASS` event.
   * @param {Mocha.Test} test The test instance.
   */
  handlePassedTest(test) {
    const symbol = this._isWindows ? '√' : '✓';

    console.log(`${this.indent()}${chalk.green(symbol)} ${test.title}`);
    this.flushTestLogs();
  }

  /**
   * Handles the `EVENT_TEST_FAIL` event.
   * @param {Mocha.Test} test The test instance.
   * @param {Error} err The error that occurred.
   */
  handleFailedTest(test, err) {
    const symbol = this._isWindows ? 'x' : '✗';

    console.log(`${this.indent()}${chalk.red(symbol)} ${test.title}`);
    this.flushTestLogs();

    console.log(`\nERROR:\n${err.stack}\n`);
  }

  /**
   * Handles the `EVENT_TEST_PENDING` event.
   * @param {Mocha.Test} test The test instance.
   */
  handlePendingTest(test) {
    console.log(this.indent() + chalk.cyan('- ' + test.title));
  }

  /**
   * Handles the `EVENT_SUITE_END` event.
   */
  handleEndSuite() {
    this._indent--;
    this._scopeIndent = 0;
  }

  /**
   * Handles the `EVENT_RUN_END` event.
   */
  handleEndRun() {
    this._indent = 0;
  }

  /**
   * Prints the buffered events, and empty the buffer.
   */
  flushTestLogs() {
    this._logBuffer.splice(0).forEach((log) => {
      console.log(this.indent() + '  ' + log);
    });
  }

  /**
   * Gets a string to indent output to align with the test.
   * @returns {string}
   */
  indent() {
    return '  '.repeat(this._indent);
  }

  /**
   * Gets a string to indent scopes and expectations for a test.
   * This indent is relative to the test.
   * @returns {string}
   */
  scopeIndent() {
    return '  '.repeat(this._scopeIndent);
  }
}

module.exports = DetailedReporter;
