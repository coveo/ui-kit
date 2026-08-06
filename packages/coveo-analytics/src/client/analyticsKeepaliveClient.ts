import {
  AnalyticsRequestClient,
  IAnalyticsClientOptions,
  IAnalyticsRequestOptions,
  PreprocessAnalyticsRequest,
} from './analyticsRequestClient';
import {EventType, IRequestPayload} from '../events';
import {fetch} from 'cross-fetch';

// Browsers cap the cumulative body size of all in-flight `keepalive` requests to 64 KiB.
// Past that budget, requests are rejected outright, so oversized events are sent without
// the flag rather than not being sent at all.
const keepaliveBodyLimitInBytes = 64 * 1024;
let inFlightKeepaliveBodyInBytes = 0;

/**
 * Sends events that must survive a page unload, such as click events and the events
 * replayed on `beforeunload`, using `fetch` with `keepalive: true`.
 *
 * This replaces the Beacon API, which accepted no headers and therefore prevented a
 * `preprocessRequest` hook from altering them. The `analyticsBeacon` client origin is kept
 * so that existing hooks branching on it keep working.
 */
export class AnalyticsKeepaliveClient implements AnalyticsRequestClient {
  constructor(private opts: IAnalyticsClientOptions) {}

  public async sendEvent(eventType: EventType, originalPayload: IRequestPayload): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error(
        `fetch is not supported in this browser. Consider adding a polyfill like "whatwg-fetch".`
      );
    }

    const {baseUrl, preprocessRequest} = this.opts;

    const paramsFragments = await this.getQueryParamsForEventType(eventType);

    const defaultOptions: IAnalyticsRequestOptions = {
      url: `${baseUrl}/analytics/${eventType}?${paramsFragments}`,
      credentials: 'include',
      mode: 'cors',
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: JSON.stringify(originalPayload),
    };

    const {options, payload} = await this.preProcessRequestAsPotentialJSONString(
      defaultOptions,
      originalPayload,
      preprocessRequest
    );

    this.sendWithKeepalive({
      ...options,
      body: this.encodeForEventType(eventType, payload),
    });
  }

  public isAvailable() {
    return typeof fetch === 'function';
  }

  public deleteHttpCookieVisitorId() {
    return Promise.resolve();
  }

  /**
   * Deliberately not awaited: callers such as the `beforeunload` handler must not block on
   * the response, and the Beacon API they replace never surfaced one either.
   */
  private sendWithKeepalive({url, ...requestOptions}: IAnalyticsRequestOptions) {
    const bodyInBytes = this.getBodySizeInBytes(requestOptions.body as string);
    const keepalive = inFlightKeepaliveBodyInBytes + bodyInBytes <= keepaliveBodyLimitInBytes;

    if (keepalive) {
      inFlightKeepaliveBodyInBytes += bodyInBytes;
    } else {
      console.warn(
        `The keepalive body size limit of ${keepaliveBodyLimitInBytes} bytes is reached. The event is sent without keepalive and may be cancelled if the page unloads.`
      );
    }

    const releaseBudget = () => {
      if (keepalive) {
        inFlightKeepaliveBodyInBytes -= bodyInBytes;
      }
    };

    fetch(url, {...requestOptions, keepalive}).then(releaseBudget, (error) => {
      releaseBudget();
      console.error('An error has occurred when sending the event.', error);
    });
  }

  private getBodySizeInBytes(body: string) {
    return typeof TextEncoder === 'undefined' ? body.length : new TextEncoder().encode(body).length;
  }

  private async preProcessRequestAsPotentialJSONString(
    defaultOptions: IAnalyticsRequestOptions,
    originalPayload: IRequestPayload,
    preprocessRequest?: PreprocessAnalyticsRequest
  ): Promise<{options: IAnalyticsRequestOptions; payload: IRequestPayload}> {
    if (!preprocessRequest) {
      return {options: defaultOptions, payload: originalPayload};
    }

    const processedRequest = await preprocessRequest(defaultOptions, 'analyticsBeacon');
    const options: IAnalyticsRequestOptions = {
      ...defaultOptions,
      ...processedRequest,
      url: processedRequest.url || defaultOptions.url,
    };

    let payload = originalPayload;
    try {
      payload = JSON.parse(options.body as string);
    } catch (e) {
      console.error('Unable to process the request body as a JSON string', e);
    }

    return {options, payload};
  }

  private encodeForEventType(eventType: EventType, payload: IRequestPayload): string {
    return this.isEventTypeLegacy(eventType)
      ? this.encodeEventToJson(eventType, payload)
      : this.encodeEventToJson(eventType, payload, this.opts.token);
  }

  private async getQueryParamsForEventType(eventType: EventType): Promise<string> {
    const {token, visitorIdProvider} = this.opts;
    const visitorId = await visitorIdProvider.getCurrentVisitorId();
    return [
      token && this.isEventTypeLegacy(eventType) ? `access_token=${token}` : '',
      visitorId ? `visitorId=${visitorId}` : '',
      'discardVisitInfo=true',
    ]
      .filter((p) => !!p)
      .join('&');
  }

  private isEventTypeLegacy(eventType: EventType) {
    return (
      [EventType.click, EventType.custom, EventType.search, EventType.view].indexOf(eventType) !==
      -1
    );
  }

  private encodeEventToJson(
    eventType: EventType,
    payload: IRequestPayload,
    access_token?: string
  ): string {
    let encoded = `${eventType}Event=${encodeURIComponent(JSON.stringify(payload))}`;
    if (access_token) {
      encoded = `access_token=${encodeURIComponent(access_token)}&${encoded}`;
    }
    return encoded;
  }
}
