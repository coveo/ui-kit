import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {COVEO_SHOPIFY_CONFIG_KEY} from '../constants';
import {init} from './init';
import {publishCustomShopifyEvent} from './shopify';

// Mock only the external dependencies we need to control
vi.mock('@coveo/headless', () => ({
  getAnalyticsNextApiBaseUrl: vi.fn(() => 'https://analytics.coveo.com'),
}));

vi.mock('./shopify', () => ({
  publishCustomShopifyEvent: vi.fn(),
}));

describe('init', () => {
  const mockOptions = {
    accessToken: 'test-token',
    organizationId: 'test-org',
    environment: 'dev' as const,
    trackingId: 'test-tracking-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call getAnalyticsNextApiBaseUrl with correct parameters', async () => {
    const {getAnalyticsNextApiBaseUrl} = await import('@coveo/headless');

    init(mockOptions);

    expect(getAnalyticsNextApiBaseUrl).toHaveBeenCalledWith(
      mockOptions.organizationId,
      mockOptions.environment
    );
  });

  it('should publish an event with all options and a client ID', () => {
    const mockPublishCustomShopifyEvent = vi.mocked(publishCustomShopifyEvent);

    init(mockOptions);

    expect(mockPublishCustomShopifyEvent).toHaveBeenCalledTimes(1);

    const [eventKey, eventData] = mockPublishCustomShopifyEvent.mock.calls[0];

    expect(eventKey).toBe(COVEO_SHOPIFY_CONFIG_KEY);
    expect(eventData).toMatchObject({
      accessToken: mockOptions.accessToken,
      organizationId: mockOptions.organizationId,
      environment: mockOptions.environment,
      trackingId: mockOptions.trackingId,
    });
    expect(eventData).toHaveProperty('clientId');
    expect(typeof eventData.clientId).toBe('string');
    expect(eventData.clientId.length).toBeGreaterThan(0);
  });

  it('should emit an event with a client ID that is a valid UUID', () => {
    const mockPublishCustomShopifyEvent = vi.mocked(publishCustomShopifyEvent);

    init(mockOptions);

    const [, eventData] = mockPublishCustomShopifyEvent.mock.calls[0];

    const validClientIdRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(eventData.clientId).toMatch(validClientIdRegex);
  });

  it('should return the same client ID on each call', () => {
    const mockPublishCustomShopifyEvent = vi.mocked(publishCustomShopifyEvent);

    init(mockOptions);
    const firstClientId =
      mockPublishCustomShopifyEvent.mock.calls[0][1].clientId;

    init(mockOptions);
    const secondClientId =
      mockPublishCustomShopifyEvent.mock.calls[1][1].clientId;

    expect(firstClientId).toBe(secondClientId);
  });
});
