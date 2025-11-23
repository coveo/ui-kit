# PR Summary: Analytics Request Assertion in Storybook Tests

## What Problem Does This Solve?

Previously, testing analytics/UA calls in Storybook+Playwright tests was challenging:

1. **MSW doesn't provide request assertions** - While MSW is great for mocking responses, it doesn't offer a built-in way to assert that requests were made
2. **Playwright's request interception has limitations** - Due to a [Chromium bug](https://github.com/microsoft/playwright/issues/6479), we couldn't access request payloads
3. **Inconsistent testing approaches** - Analytics testing used a different pattern than other API mocking

## What's the Solution?

We enhanced the existing MSW API harness infrastructure to automatically capture all requests. This provides a unified, type-safe way to:

- ✅ Capture all requests made to mocked endpoints
- ✅ Access full request payloads (no Chromium limitations)
- ✅ Assert on request count, headers, body, and timing
- ✅ Use the same MSW-based pattern for all API testing

## Key Changes

### 1. Enhanced EndpointHarness (All Endpoints)

**Every** mocked endpoint now captures requests automatically:

```typescript
// Clear captured requests (call in beforeEach)
endpoint.clearCapturedRequests();

// Get all captured requests
const requests = endpoint.getCapturedRequests();

// Get the most recent request
const lastRequest = endpoint.getLastCapturedRequest();

// Get request count
const count = endpoint.getCapturedRequestCount();

// Wait for next request (async)
const request = await endpoint.waitForNextRequest(5000);
```

### 2. New MockAnalyticsApi

Specifically designed for capturing analytics calls:

```typescript
import { MockAnalyticsApi } from '@/storybook-utils/api/analytics/mock';

const analyticsHarness = new MockAnalyticsApi();

// In your story
parameters: {
  msw: {
    handlers: [...analyticsHarness.handlers],
  },
}
```

### 3. Example Stories

See `storybook-pages/examples/analytics-tracking.new.stories.tsx` for complete examples.

## Quick Start

### Step 1: Import and Create Harness

```typescript
import { MockAnalyticsApi } from '@/storybook-utils/api/analytics/mock';

const analyticsHarness = new MockAnalyticsApi();
```

### Step 2: Add to MSW Handlers

```typescript
const meta: Meta = {
  parameters: {
    msw: {
      handlers: [
        ...commerceHarness.handlers, // your existing handlers
        ...analyticsHarness.handlers, // add analytics handlers
      ],
    },
  },
};
```

### Step 3: Assert in Your Story

```typescript
export const MyStory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Clear previous requests
    analyticsHarness.clearAllRequests();
    
    // Trigger action
    await userEvent.click(canvas.getByRole('button'));
    
    // Wait for and verify analytics
    const request = await analyticsHarness.eventsEndpoint.waitForNextRequest();
    
    expect(request.body).toMatchObject({
      eventType: 'click',
      eventValue: 'my-button',
    });
  },
};
```

## Benefits

| Feature | Before | After |
|---------|--------|-------|
| **Access Payload** | ❌ Blocked by browser bug | ✅ Full access |
| **Type Safety** | ❌ No types | ✅ TypeScript support |
| **Request Count** | ❌ Manual tracking | ✅ `getCapturedRequestCount()` |
| **Consistency** | ❌ Different pattern | ✅ Same as other mocks |
| **Ease of Use** | ⚠️ Complex | ✅ Simple API |

## Backward Compatibility

✅ **100% backward compatible** - All existing mocks continue to work unchanged. Request tracking is purely additive and optional.

## Documentation

- **Quick Reference**: See `ANALYTICS_TRACKING.md` for comprehensive guide
- **API Reference**: See `README.md` for structure details
- **Usage Patterns**: See `USAGE.md` for common patterns
- **Examples**: See `storybook-pages/examples/analytics-tracking.new.stories.tsx`

## Questions?

See the documentation or check the example stories for complete working examples.
