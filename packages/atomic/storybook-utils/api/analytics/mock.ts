import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import {baseResponse} from './analytics-response.js';

/**
 * Mock Analytics API for intercepting and asserting on analytics/UA calls.
 *
 * This mock captures all analytics requests, allowing tests to:
 * - Verify that analytics calls are made
 * - Assert on the content of analytics payloads
 * - Check the timing and count of analytics events
 *
 * @example
 * ```typescript
 * import { MockAnalyticsApi } from '@/storybook-utils/api/analytics/mock';
 *
 * const analyticsHarness = new MockAnalyticsApi();
 *
 * const meta: Meta = {
 *   parameters: {
 *     msw: {
 *       handlers: [...analyticsHarness.handlers],
 *     },
 *   },
 * };
 *
 * export const MyStory: Story = {
 *   play: async ({ canvasElement }) => {
 *     // Perform action that triggers analytics
 *     await userEvent.click(someElement);
 *
 *     // Wait for and assert on the analytics call
 *     const request = await analyticsHarness.eventsEndpoint.waitForNextRequest();
 *     expect(request.body).toMatchObject({
 *       eventType: 'click',
 *       eventValue: 'product-link',
 *     });
 *   },
 * };
 * ```
 */
export class MockAnalyticsApi implements MockApi {
  /**
   * Endpoint for analytics events (v1).
   * Captures calls to `/rest/organizations/:orgId/events/v1`.
   */
  readonly eventsEndpoint;

  constructor(basePath: string = 'https://:orgId.analytics.org.coveo.com') {
    this.eventsEndpoint = new EndpointHarness<typeof baseResponse>(
      'POST',
      `${basePath}/rest/organizations/:orgId/events/v1`,
      baseResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [this.eventsEndpoint.generateHandler()];
  }

  /**
   * Clear all captured requests from all endpoints.
   * Call this in beforeEach to ensure a clean slate for each test.
   */
  clearAllRequests() {
    this.eventsEndpoint.clearCapturedRequests();
  }

  /**
   * Get the total count of analytics requests across all endpoints.
   */
  getTotalRequestCount(): number {
    return this.eventsEndpoint.getCapturedRequestCount();
  }
}
