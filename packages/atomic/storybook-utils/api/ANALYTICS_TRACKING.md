# Analytics Request Tracking in Storybook Tests

## Problem Statement

When testing components in Storybook with Playwright, we need to validate that analytics (UA) calls are properly sent. Previously, this was difficult because:

1. MSW (Mock Service Worker) is used to mock API responses but doesn't provide an easy way to assert on requests
2. Playwright's `page.waitForRequest()` has limitations due to a Chromium bug that prevents accessing request payloads (see [playwright#6479](https://github.com/microsoft/playwright/issues/6479))

## Solution

We've enhanced the MSW API harness infrastructure to automatically capture all requests made to mocked endpoints. This solution works in two contexts:

1. **Storybook play functions** - For Storybook interaction testing
2. **Playwright e2e tests** - For tests that load stories in an iframe

## Key Features

### 1. Automatic Request Capture
Every `EndpointHarness` now automatically captures:
- Full URL
- HTTP method
- Request headers
- Request body (parsed as JSON when possible)
- Timestamp

### 2. MockAnalyticsApi
A new mock API specifically for capturing analytics/UA calls:
- Intercepts calls to `https://:orgId.analytics.org.coveo.com/rest/organizations/:orgId/events/v1`
- Provides convenient methods for asserting on analytics events
- Works seamlessly with existing MSW-based mocks

### 3. Request Assertion Methods
New methods on `EndpointHarness`:
- `clearCapturedRequests()` - Clear all captured requests (call in beforeEach)
- `getCapturedRequests()` - Get array of all captured requests
- `getLastCapturedRequest()` - Get the most recent request
- `getCapturedRequestCount()` - Get the count of requests
- `waitForNextRequest(timeout)` - Async wait for next request (useful in async tests)

### 4. AnalyticsHelper for Playwright
A new helper class for accessing captured requests in Playwright e2e tests:
- Bridges between MSW harness in iframe and Playwright test context
- Provides async methods to query captured requests
- Works with the standard Playwright page object pattern

## Usage: Storybook Play Functions

```typescript
import { MockAnalyticsApi } from '@/storybook-utils/api/analytics/mock';
import { MockCommerceApi } from '@/storybook-utils/api/commerce/mock';
import { userEvent, waitFor, within, expect } from '@storybook/test';

// Create harnesses
const analyticsHarness = new MockAnalyticsApi();
const commerceHarness = new MockCommerceApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [
        ...commerceHarness.handlers,
        ...analyticsHarness.handlers, // Include analytics handlers
      ],
    },
  },
};

export const TracksProductClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Clear any previous analytics calls
    analyticsHarness.clearAllRequests();
    
    // Wait for products to load
    await waitFor(() => {
      expect(canvas.getAllByRole('link').length).toBeGreaterThan(0);
    });
    
    // Click a product link
    const productLink = canvas.getAllByRole('link')[0];
    await userEvent.click(productLink);
    
    // Wait for and verify the analytics call
    const analyticsRequest = await analyticsHarness.eventsEndpoint.waitForNextRequest(5000);
    
    // Assert on the analytics payload
    expect(analyticsRequest).toBeDefined();
    expect(analyticsRequest.method).toBe('POST');
    expect(analyticsRequest.body).toMatchObject({
      eventType: 'ec.productClick',
      eventValue: expect.any(String),
    });
    
    console.log('✓ Analytics event captured:', analyticsRequest.body);
  },
};
```

## Usage: Playwright E2E Tests (Iframe Context)

For Playwright e2e tests that load stories in an iframe, use the `AnalyticsHelper`:

### Step 1: Add Analytics Mock to Your Story

```typescript
import { MockAnalyticsApi } from '@/storybook-utils/api/analytics/mock';

const analyticsHarness = new MockAnalyticsApi();

const meta: Meta = {
  parameters: {
    msw: {
      handlers: [...analyticsHarness.handlers],
    },
  },
  play: async (context) => {
    // Expose the harness to window for Playwright access
    if (typeof window !== 'undefined') {
      (window as any).__mswAnalyticsHarness = analyticsHarness;
    }
    await basePlay(context);
  },
};
```

### Step 2: Use AnalyticsHelper in Your E2E Test

```typescript
import { expect, test } from './fixture';
import { AnalyticsHelper } from '@/playwright-utils/analytics-helper';

test('should send analytics with full payload access', async ({ productLink, page }) => {
  await productLink.load();
  await productLink.hydrated.first().waitFor({state: 'visible'});

  const analyticsHelper = new AnalyticsHelper(page);

  // Clear any previous requests
  await analyticsHelper.clearRequests();

  // Trigger action
  await productLink.anchor().first().click();

  // Wait for and verify the analytics request
  const request = await analyticsHelper.waitForRequest();

  // Now we have full payload access!
  expect(request).toBeDefined();
  expect(request.method).toBe('POST');
  expect(request.url).toMatch(/analytics\.org\.coveo\.com/);

  const payload = request.body as Record<string, unknown>;
  expect(payload).toMatchObject({
    eventType: 'ec.productClick',
  });
});
```

### AnalyticsHelper API

The `AnalyticsHelper` class provides methods to access captured requests from the iframe:

```typescript
class AnalyticsHelper {
  constructor(page: Page);
  
  // Clear all captured requests
  async clearRequests(): Promise<void>;
  
  // Get all captured requests
  async getRequests(): Promise<CapturedRequest[]>;
  
  // Get the most recent request
  async getLastRequest(): Promise<CapturedRequest | undefined>;
  
  // Get the count of requests
  async getRequestCount(): Promise<number>;
  
  // Wait for the next request (with timeout)
  async waitForRequest(timeout?: number): Promise<CapturedRequest>;
}
```

## Advantages Over Previous Approach

1. **Full Payload Access**: No longer limited by Chromium bug - can access complete request payload
2. **Type-Safe Assertions**: Assert on the full structure of analytics events with TypeScript support
3. **Consistent Patterns**: Uses the same MSW-based approach as other API mocks
4. **Better Testability**: Works in both Storybook play functions and Playwright e2e tests
5. **Flexible Assertions**: Check count, timing, headers, and payload content
6. **No External Dependencies**: Works entirely within MSW, no need for Playwright request interception

## Common Patterns

### Pattern 1: Verify Single Analytics Call

```typescript
export const SingleAnalytics: Story = {
  play: async ({ canvasElement }) => {
    analyticsHarness.clearAllRequests();
    
    await triggerAction();
    
    expect(analyticsHarness.eventsEndpoint.getCapturedRequestCount()).toBe(1);
    
    const request = analyticsHarness.eventsEndpoint.getLastCapturedRequest();
    expect(request?.body).toMatchObject({
      eventType: 'expected-event-type',
    });
  },
};
```

### Pattern 2: Verify Multiple Analytics Calls

```typescript
export const MultipleAnalytics: Story = {
  play: async ({ canvasElement }) => {
    analyticsHarness.clearAllRequests();
    
    await action1();
    await action2();
    await action3();
    
    const requests = analyticsHarness.eventsEndpoint.getCapturedRequests();
    expect(requests).toHaveLength(3);
    
    // Assert on sequence of events
    expect(requests[0].body.eventType).toBe('event1');
    expect(requests[1].body.eventType).toBe('event2');
    expect(requests[2].body.eventType).toBe('event3');
  },
};
```

### Pattern 3: Wait for Async Analytics

```typescript
export const AsyncAnalytics: Story = {
  play: async ({ canvasElement }) => {
    analyticsHarness.clearAllRequests();
    
    await triggerAsyncAction();
    
    // Wait up to 5 seconds for the analytics call
    const request = await analyticsHarness.eventsEndpoint.waitForNextRequest(5000);
    
    expect(request.body).toBeDefined();
  },
};
```

### Pattern 4: Reset Between Stories

Always clear captured requests in `beforeEach`:

```typescript
const meta: Meta = {
  beforeEach: () => {
    analyticsHarness.clearAllRequests();
  },
  parameters: {
    msw: {
      handlers: [...analyticsHarness.handlers],
    },
  },
};
```

## API Reference

### MockAnalyticsApi

```typescript
class MockAnalyticsApi {
  eventsEndpoint: EndpointHarness<...>;
  
  get handlers(): HttpHandler[];
  clearAllRequests(): void;
  getTotalRequestCount(): number;
}
```

### EndpointHarness Request Tracking Methods

```typescript
class EndpointHarness<TResponse> {
  // Clear captured requests
  clearCapturedRequests(): void;
  
  // Get all captured requests
  getCapturedRequests(): CapturedRequest[];
  
  // Get the most recent request
  getLastCapturedRequest(): CapturedRequest | undefined;
  
  // Get request count
  getCapturedRequestCount(): number;
  
  // Wait for next request (with timeout)
  waitForNextRequest(timeout?: number): Promise<CapturedRequest>;
}
```

### CapturedRequest Interface

```typescript
interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;  // Parsed as JSON when possible
  timestamp: number;
}
```

## Testing the Feature

See the example stories in:
- `packages/atomic/storybook-pages/examples/analytics-tracking.new.stories.tsx`

These stories demonstrate:
- Basic analytics tracking
- Asserting on payload content
- Verifying multiple analytics calls
- Checking request count
- Accessing the last request

## Migration Guide

### Before (using Playwright's waitForRequest):

```typescript
test('should send analytics', async ({ page }) => {
  const analyticsUrlRegex = /analytics\.org\.coveo\.com\/rest\/organizations\/.+\/events\/v1/;
  const requestPromise = page.waitForRequest(analyticsUrlRegex);
  
  await performAction();
  
  const request = await requestPromise;
  
  // Due to a bug in chromium, we cannot access the request payload
  // See https://github.com/microsoft/playwright/issues/6479
  expect(request).toBeDefined();
});
```

### After (using MockAnalyticsApi):

```typescript
const analyticsHarness = new MockAnalyticsApi();

export const SendsAnalytics: Story = {
  play: async ({ canvasElement }) => {
    analyticsHarness.clearAllRequests();
    
    await performAction();
    
    const request = await analyticsHarness.eventsEndpoint.waitForNextRequest();
    
    // Full access to request payload!
    expect(request.body).toMatchObject({
      eventType: 'my-event',
      eventValue: 'expected-value',
    });
  },
};
```

## Files Modified/Created

- `storybook-utils/api/_base.ts` - Enhanced with request tracking
- `storybook-utils/api/analytics/mock.ts` - New MockAnalyticsApi
- `storybook-utils/api/analytics/analytics-response.ts` - Analytics response data
- `storybook-utils/api/README.md` - Updated with request tracking docs
- `storybook-utils/api/USAGE.md` - Updated with analytics assertion patterns
- `storybook-pages/examples/analytics-tracking.new.stories.tsx` - Example stories

## Further Documentation

- [MSW API Harness Structure Guide](./README.md)
- [MSW API Harness Usage Guide](./USAGE.md)
