/* eslint-disable @typescript-eslint/no-explicit-any */
import {Page, Request, expect} from '@playwright/test';
import {
  isEventProtocol,
  isUaClickEvent,
  isUaCustomEvent,
  isUaSearchEvent,
} from '../utils/requests';
import {AnalyticsMode} from '../utils/analyticsMode';

const exampleTrackingId = 'quantic_e2e_tracking_id';

export class AnalyticsObject {
  constructor(
    protected page: Page,
    public analyticsMode: AnalyticsMode
  ) {
    this.page = page;
    this.analyticsMode = analyticsMode;
  }

  static async setCookieToEnableNextAnalytics(page: Page, url: string) {
    const context = page.context();
    await context.addCookies([
      {name: 'LSKey-c$Coveo-Pendragon', value: exampleTrackingId, url},
      {name: 'Coveo-Pendragon', value: exampleTrackingId, url},
    ]);
  }

  async waitForClickUaAnalytics(
    actionCause: string,
    additionalMatch?: (event: {
      actionCause: string;
      customData?: {
        [key: string]: unknown;
        documentId?: Record<string, string>;
      };
      [key: string]: unknown;
    }) => boolean
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const event = request.postDataJSON?.();
        const eventData = JSON.parse(event.clickEvent);

        if (eventData?.actionCause !== actionCause) return false;
        if (additionalMatch && !additionalMatch(eventData)) return false;
        return true;
      }
      return false;
    });
    return uaRequest;
  }

  async waitForCustomUaAnalytics(
    {eventType, eventValue}: {eventType: string; eventValue: string},
    additionalMatch?: (event: {
      eventValue: string;
      eventType: string;
      customData?: Record<string, string>;
      [key: string]: unknown;
    }) => boolean
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const event = request.postDataJSON?.();
        if (event?.eventType !== eventType) return false;
        if (event?.eventValue !== eventValue) return false;
        if (additionalMatch && !additionalMatch(event)) return false;

        return true;
      }
      return false;
    });
    return uaRequest;
  }

  async waitForSearchUaAnalytics(
    actionCause: string,
    additionalMatch?: (event: {
      actionCause: string;
      customData?: Record<string, string>;
      [key: string]: unknown;
    }) => boolean
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const event = request.postDataJSON?.();
        return (
          event?.actionCause === actionCause &&
          (additionalMatch ? additionalMatch(event) === true : true)
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForEventProtocolAnalytics(
    expectedEventType: string,
    additionalMatch?: (event: {
      [key: string]: unknown;
      details?: Record<string, string>;
      itemMetadata?: Record<string, string>;
    }) => boolean
  ): Promise<Request> {
    const analyticsRequest = this.page.waitForRequest(async (request) => {
      if (isEventProtocol(request)) {
        const event = request.postDataJSON?.()?.[0];
        if (event.meta?.type !== expectedEventType) return false;
        if (event.meta?.config?.trackingId !== exampleTrackingId) return false;
        if (additionalMatch && !additionalMatch(event)) return false;

        await this.validateEventWithEventAPI(request.url(), event);

        return true;
      }
      return false;
    });
    return analyticsRequest;
  }

  async validateEventWithEventAPI(url: string, body: object) {
    const validateUrl = url.replace('/v1', '/v1/validate');
    const response = await fetch(validateUrl, {
      method: 'POST',
      body: JSON.stringify([body]),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const parsedResponse = (await response.json())?.[0];

    parsedResponse?.errors?.forEach(
      (error: {message: string; type: string; path: string}) => {
        console.error('❌❌❌ EP validation ❌❌❌', error.message);
        console.log('Validation error details:', error);
        throw new Error(`${error.type}: ${error.message}`);
      }
    );

    expect(parsedResponse).toHaveProperty('valid', true);
  }

  static isMatchingPayload(
    actual: Record<string, any>,
    expected: Record<string, any>
  ): boolean {
    return Object.keys(expected).every(
      (key) => actual?.[key] === expected[key]
    );
  }
}
