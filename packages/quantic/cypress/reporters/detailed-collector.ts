import * as path from 'path';
import {Socket} from 'net';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      logDetail: typeof logDetail;
    }
  }
}

export interface Message {
  type: string;
  content: string;
}

export interface Collector {
  beginScope(title: string): void;
  endScope(): void;
  expectation(message: string): void;
}

class DetailedCollector implements Collector {
  static _instance: DetailedCollector;

  constructor() {}

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
    client.connect(path.join(process.cwd(), 'ipc.sock'), () => {
      client.write(JSON.stringify(data));
      client.destroy();
    });
  }

  static getInstance() {
    if (!DetailedCollector._instance) {
      DetailedCollector._instance = new DetailedCollector();
    }

    return DetailedCollector._instance;
  }
}

class VoidCollector implements Collector {
  beginScope(title: string) {}
  endScope() {}
  expectation(message: string) {}
}

export function getCollector(enable: boolean): Collector {
  return enable ? DetailedCollector.getInstance() : new VoidCollector();
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
  });
}

export function logDetail(message: string) {
  cy.task('detailedExpectation', message);
}

export function registerDetailedReporterCommands() {
  Cypress.Commands.add('logDetail', logDetail);
}

export function scope(title: string, delegate: () => void): void {
  try {
    cy.task('detailedScopeBegin', title);

    delegate();
  } finally {
    cy.task('detailedScopeEnd');
  }
}
