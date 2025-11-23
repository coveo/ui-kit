import {expect, userEvent, waitFor, within} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockAnalyticsApi} from '@/storybook-utils/api/analytics/mock';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

/**
 * This story demonstrates how to use the MockAnalyticsApi to capture and assert
 * on analytics/UA calls in Storybook tests.
 *
 * The key difference from the old approach is that we can now:
 * 1. Access the full request payload (not limited by Chromium bug)
 * 2. Assert on the content of analytics events
 * 3. Check the timing and count of analytics calls
 * 4. Use a consistent MSW-based approach with other API mocks
 */

// Create the analytics harness
const analyticsHarness = new MockAnalyticsApi();
const commerceHarness = new MockCommerceApi();

const {decorator: commerceInterfaceDecorator, play: basePlay} =
  wrapInCommerceInterface({
    type: 'product-listing',
    engineConfig: {
      context: {
        view: {
          url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
        },
        language: 'en',
        country: 'US',
        currency: 'USD',
      },
      preprocessRequest: (request) => {
        const parsed = JSON.parse(request.body as string);
        parsed.perPage = 3;
        request.body = JSON.stringify(parsed);
        return request;
      },
    },
    includeCodeRoot: false,
  });

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList(
  'list',
  false
);
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-link',
  title: 'Examples/Analytics Tracking',
  id: 'examples-analytics-tracking',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...commerceHarness.handlers, ...analyticsHarness.handlers],
    },
  },
  render: () => html`<atomic-product-link></atomic-product-link>`,
  play: async (context) => {
    // Expose the analytics harness to window for Playwright e2e tests
    if (typeof window !== 'undefined') {
      // biome-ignore lint/suspicious/noExplicitAny: window augmentation for Playwright e2e test access
      (window as any).__mswAnalyticsHarness = analyticsHarness;
    }
    await basePlay(context);
  },
};

export default meta;

/**
 * Example: Basic analytics tracking
 * This story demonstrates how to verify that an analytics call is made when clicking a product link.
 */
export const BasicAnalyticsTracking: Story = {
  name: 'Basic Analytics Tracking',
  play: async (context) => {
    await basePlay(context);
    const canvas = within(context.canvasElement);

    // Clear any previous analytics calls
    analyticsHarness.clearAllRequests();

    // Wait for products to load
    await waitFor(
      async () => {
        const links = canvas.getAllByRole('link');
        await expect(links.length).toBeGreaterThan(0);
      },
      {timeout: 5000}
    );

    // Click on the first product link
    const productLink = canvas.getAllByRole('link')[0];
    await userEvent.click(productLink);

    // Wait for the analytics call to be made
    const analyticsRequest =
      await analyticsHarness.eventsEndpoint.waitForNextRequest(5000);

    // Verify the analytics request was made
    expect(analyticsRequest).toBeDefined();
    expect(analyticsRequest.method).toBe('POST');

    // Verify the URL pattern
    expect(analyticsRequest.url).toMatch(
      /analytics\.org\.coveo\.com\/rest\/organizations\/.+\/events\/v1/
    );

    // Log the captured analytics for demonstration
    console.log('Captured analytics event:', analyticsRequest.body);
  },
};

/**
 * Example: Asserting on analytics payload
 * This story demonstrates how to verify the content of the analytics payload.
 */
export const AssertOnAnalyticsPayload: Story = {
  name: 'Assert on Analytics Payload',
  play: async (context) => {
    await basePlay(context);
    const canvas = within(context.canvasElement);

    analyticsHarness.clearAllRequests();

    await waitFor(
      async () => {
        const links = canvas.getAllByRole('link');
        await expect(links.length).toBeGreaterThan(0);
      },
      {timeout: 5000}
    );

    const productLink = canvas.getAllByRole('link')[0];
    await userEvent.click(productLink);

    const analyticsRequest =
      await analyticsHarness.eventsEndpoint.waitForNextRequest(5000);

    // Assert on the analytics payload structure
    const payload = analyticsRequest.body as Record<string, unknown>;

    // Verify it contains expected fields
    expect(payload).toHaveProperty('eventType');
    expect(payload).toHaveProperty('eventValue');

    // For commerce product clicks, we expect specific event types
    if (payload.eventType === 'ec.productClick') {
      console.log('✓ Product click event detected');
      console.log('Product details:', payload.eventValue);
    }
  },
};

/**
 * Example: Verifying multiple analytics calls
 * This story demonstrates how to track multiple analytics events.
 */
export const MultipleAnalyticsCalls: Story = {
  name: 'Multiple Analytics Calls',
  play: async (context) => {
    await basePlay(context);
    const canvas = within(context.canvasElement);

    analyticsHarness.clearAllRequests();

    await waitFor(
      async () => {
        const links = canvas.getAllByRole('link');
        await expect(links.length).toBeGreaterThan(0);
      },
      {timeout: 5000}
    );

    const links = canvas.getAllByRole('link');

    // Click on first product
    await userEvent.click(links[0]);
    await analyticsHarness.eventsEndpoint.waitForNextRequest(5000);

    // Click on second product
    if (links.length > 1) {
      await userEvent.click(links[1]);
      await analyticsHarness.eventsEndpoint.waitForNextRequest(5000);
    }

    // Verify we captured multiple analytics calls
    const allRequests = analyticsHarness.eventsEndpoint.getCapturedRequests();
    expect(allRequests.length).toBeGreaterThanOrEqual(2);

    console.log(`✓ Captured ${allRequests.length} analytics events`);
    allRequests.forEach((req, index) => {
      console.log(`Event ${index + 1}:`, req.body);
    });
  },
};

/**
 * Example: Checking analytics request count
 * This story demonstrates how to verify the exact number of analytics calls.
 */
export const AnalyticsRequestCount: Story = {
  name: 'Analytics Request Count',
  play: async (context) => {
    await basePlay(context);
    const canvas = within(context.canvasElement);

    analyticsHarness.clearAllRequests();

    await waitFor(
      async () => {
        const links = canvas.getAllByRole('link');
        await expect(links.length).toBeGreaterThan(0);
      },
      {timeout: 5000}
    );

    // Initial count should be 0 (after clearing)
    expect(analyticsHarness.eventsEndpoint.getCapturedRequestCount()).toBe(0);

    // Click a product link
    const productLink = canvas.getAllByRole('link')[0];
    await userEvent.click(productLink);

    // Wait for analytics
    await analyticsHarness.eventsEndpoint.waitForNextRequest(5000);

    // Verify exactly one analytics call was made
    expect(analyticsHarness.eventsEndpoint.getCapturedRequestCount()).toBe(1);

    console.log(
      '✓ Analytics call count:',
      analyticsHarness.eventsEndpoint.getCapturedRequestCount()
    );
  },
};

/**
 * Example: Accessing the last analytics request
 * This story demonstrates how to quickly access just the most recent analytics call.
 */
export const LastAnalyticsRequest: Story = {
  name: 'Last Analytics Request',
  play: async (context) => {
    await basePlay(context);
    const canvas = within(context.canvasElement);

    analyticsHarness.clearAllRequests();

    await waitFor(
      async () => {
        const links = canvas.getAllByRole('link');
        await expect(links.length).toBeGreaterThan(0);
      },
      {timeout: 5000}
    );

    const productLink = canvas.getAllByRole('link')[0];
    await userEvent.click(productLink);

    await analyticsHarness.eventsEndpoint.waitForNextRequest(5000);

    // Get the last request without iterating through all
    const lastRequest =
      analyticsHarness.eventsEndpoint.getLastCapturedRequest();

    expect(lastRequest).toBeDefined();
    console.log('✓ Most recent analytics event:', lastRequest?.body);
  },
};
