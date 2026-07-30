import {WebStorage, NullStorage, CookieAndLocalStorage} from '../storage';
import {AnalyticsKeepaliveClient} from './analyticsKeepaliveClient';
import {hasLocalStorage, hasCookieStorage} from '../detector';
import {
  AnalyticsRequestClient,
  IAnalyticsClientOptions,
  NoopAnalyticsClient,
} from './analyticsRequestClient';
import {AnalyticsFetchClient} from './analyticsFetchClient';
import {BufferedRequest} from './analytics';
import {EventType} from '../events';

export interface IRuntimeEnvironment {
  storage: WebStorage;
  client: AnalyticsRequestClient;
  getClientDependingOnEventType(eventType: EventType): AnalyticsRequestClient;
}

export class BrowserRuntime implements IRuntimeEnvironment {
  public storage: WebStorage;
  public client: AnalyticsFetchClient;
  private keepaliveClient: AnalyticsKeepaliveClient;

  constructor(
    clientOptions: IAnalyticsClientOptions,
    getUnprocessedRequests: () => Array<BufferedRequest>
  ) {
    if (hasLocalStorage() && hasCookieStorage()) {
      this.storage = new CookieAndLocalStorage();
    } else if (hasLocalStorage()) {
      this.storage = localStorage;
    } else {
      console.warn('BrowserRuntime detected no valid storage available.', this);
      this.storage = new NullStorage();
    }
    this.client = new AnalyticsFetchClient(clientOptions);
    this.keepaliveClient = new AnalyticsKeepaliveClient(clientOptions);
    window.addEventListener('beforeunload', () => {
      const requests = getUnprocessedRequests();
      for (let {eventType, payload} of requests) {
        this.keepaliveClient.sendEvent(eventType, payload);
      }
    });
  }

  public getClientDependingOnEventType(eventType: EventType) {
    return eventType === 'click' && this.keepaliveClient.isAvailable()
      ? this.keepaliveClient
      : this.client;
  }
}

export class NodeJSRuntime implements IRuntimeEnvironment {
  public storage: WebStorage;
  public client: AnalyticsFetchClient;

  constructor(clientOptions: IAnalyticsClientOptions, storage?: WebStorage) {
    this.storage = storage || new NullStorage();
    this.client = new AnalyticsFetchClient(clientOptions);
  }

  getClientDependingOnEventType(eventType: EventType): AnalyticsRequestClient {
    return this.client;
  }
}

export class NoopRuntime implements IRuntimeEnvironment {
  public storage = new NullStorage();
  public client = new NoopAnalyticsClient();

  getClientDependingOnEventType(eventType: EventType): AnalyticsRequestClient {
    return this.client;
  }
}
