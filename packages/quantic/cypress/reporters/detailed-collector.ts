import {platform} from 'os';
import * as path from 'path';
import {Socket} from 'net';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      logDetail: typeof logDetail;
      logAction: typeof logAction;
    }
  }
}

export interface Message {
  type: string;
  content: string;
}

export interface DetailedCollector {
  beginScope(title: string): void;
  endScope(): void;
  expectation(message: string): void;
  action(message: string): void;
}

class DetailedCollectorImpl implements DetailedCollector {
  static _instance: DetailedCollector;
  private _isWindows: boolean;

  constructor() {
    this._isWindows = platform() === 'win32';
  }

  action(message: string): void {
    this.sendToReporter({
      type: 'action',
      content: message,
    });
  }

  beginScope(title: string) {
    this.sendToReporter({
      type: 'scope:begin',
      content: title,
    });
  }

  endScope() {
    this.sendToReporter({
      type: 'scope:end',
      content: '',
    });
  }

  expectation(message: string) {
    this.sendToReporter({
      type: 'expectation',
      content: message,
    });
  }

  sendToReporter(data: Message) {
    const client = new Socket();
    client.connect(this.getServerPath(), () => {
      client.write(JSON.stringify(data));
      client.destroy();
    });
  }

  private getServerPath() {
    // on Windows, the server path must be a named pipe.
    // on other platforms, a file path is used to open a local socket.
    return this._isWindows
      ? '\\\\.\\pipe\\detailed-reporter'
      : path.join(process.cwd(), 'ipc.sock');
  }

  static getInstance() {
    if (!DetailedCollectorImpl._instance) {
      DetailedCollectorImpl._instance = new DetailedCollectorImpl();
    }

    return DetailedCollectorImpl._instance;
  }
}

class VoidDetailedCollector implements DetailedCollector {
  beginScope(title: string) {}
  endScope() {}
  expectation(message: string) {}
  action(message: string) {}
}

export function getCollector(enable: boolean): DetailedCollector {
  return enable
    ? DetailedCollectorImpl.getInstance()
    : new VoidDetailedCollector();
}

export function registerDetailedReporterPlugin(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) {
  const enable = path.basename(config.reporter) === 'detailed-reporter.js';
  const collector = getCollector(enable);

  on('task', {
    detailedScopeBegin(title) {
      collector.beginScope(title);
      return null;
    },
    detailedScopeEnd() {
      collector.endScope();
      return null;
    },
    detailedExpectation(message: string) {
      collector.expectation(message);
      return null;
    },
    detailedAction(message: string) {
      collector.action(message);
      return null;
    },
  });
}

export function logDetail(message: string) {
  cy.task('detailedExpectation', message);
}

export function logAction(message: string) {
  cy.task('detailedAction', message);
}

export function registerDetailedReporterCommands() {
  Cypress.Commands.add('logDetail', logDetail);
  Cypress.Commands.add('logAction', logAction);
}

export function scope(title: string, delegate: () => void): void {
  try {
    cy.task('detailedScopeBegin', title);

    delegate();
  } finally {
    cy.task('detailedScopeEnd');
  }
}
