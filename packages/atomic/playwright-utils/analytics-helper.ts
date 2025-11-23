import type {Page} from '@playwright/test';
import type {CapturedRequest} from './api/_base';

/**
 * Helper class for accessing captured analytics requests in Playwright e2e tests.
 *
 * This class provides a bridge between the MSW harness running in the Storybook
 * iframe and Playwright tests running outside the iframe.
 *
 * @example
 * ```typescript
 * import {AnalyticsHelper} from '@/playwright-utils/analytics-helper';
 *
 * test('should send analytics', async ({page, productLink}) => {
 *   await productLink.load();
 *
 *   const analyticsHelper = new AnalyticsHelper(page);
 *
 *   // Clear previous requests
 *   await analyticsHelper.clearRequests();
 *
 *   // Trigger action
 *   await productLink.anchor().first().click();
 *
 *   // Wait for and verify analytics
 *   const request = await analyticsHelper.waitForRequest();
 *
 *   expect(request.body).toMatchObject({
 *     eventType: 'ec.productClick',
 *   });
 * });
 * ```
 */
export class AnalyticsHelper {
  constructor(private page: Page) {}

  /**
   * Clear all captured analytics requests in the iframe.
   */
  async clearRequests(): Promise<void> {
    await this.page.evaluate(() => {
      if (window.__mswAnalyticsHarness) {
        window.__mswAnalyticsHarness.eventsEndpoint.clearCapturedRequests();
      }
    });
  }

  /**
   * Get all captured analytics requests from the iframe.
   */
  async getRequests(): Promise<CapturedRequest[]> {
    return this.page.evaluate(() => {
      if (window.__mswAnalyticsHarness) {
        return window.__mswAnalyticsHarness.eventsEndpoint.getCapturedRequests();
      }
      return [];
    });
  }

  /**
   * Get the most recent captured analytics request.
   */
  async getLastRequest(): Promise<CapturedRequest | undefined> {
    return this.page.evaluate(() => {
      if (window.__mswAnalyticsHarness) {
        return window.__mswAnalyticsHarness.eventsEndpoint.getLastCapturedRequest();
      }
      return undefined;
    });
  }

  /**
   * Get the count of captured analytics requests.
   */
  async getRequestCount(): Promise<number> {
    return this.page.evaluate(() => {
      if (window.__mswAnalyticsHarness) {
        return window.__mswAnalyticsHarness.eventsEndpoint.getCapturedRequestCount();
      }
      return 0;
    });
  }

  /**
   * Wait for the next analytics request to be captured.
   * Polls the iframe for new requests.
   *
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   * @returns Promise that resolves with the captured request
   */
  async waitForRequest(timeout = 5000): Promise<CapturedRequest> {
    const startTime = Date.now();
    const startCount = await this.getRequestCount();

    while (Date.now() - startTime < timeout) {
      const currentCount = await this.getRequestCount();
      if (currentCount > startCount) {
        const lastRequest = await this.getLastRequest();
        if (lastRequest) {
          return lastRequest;
        }
      }
      // Wait a bit before checking again
      await this.page.waitForTimeout(50);
    }

    throw new Error(`Timeout waiting for analytics request after ${timeout}ms`);
  }
}

/**
 * Extend the Window interface to include the MSW analytics harness.
 */
declare global {
  interface Window {
    __mswAnalyticsHarness?: {
      eventsEndpoint: {
        clearCapturedRequests(): void;
        getCapturedRequests(): CapturedRequest[];
        getLastCapturedRequest(): CapturedRequest | undefined;
        getCapturedRequestCount(): number;
      };
    };
  }
}
