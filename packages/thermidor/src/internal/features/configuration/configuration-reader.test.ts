import {describe, expect, it} from 'vitest';
import {
  readConversationRequestDefaults,
  readEndpointClientConfiguration,
} from './configuration-reader.js';

type TestState = {
  configuration?: {
    organizationId: string;
    accessToken: string;
    trackingId: string;
    language: string;
    country: string;
    currency: string;
    endpoint?: string;
  };
};

const buildReader = (state: TestState) => {
  return {
    read: <T>(selector: (state: TestState) => T) => selector(state),
  };
};

describe('configuration-reader', () => {
  it('reads endpoint client configuration from state', () => {
    const reader = buildReader({
      configuration: {
        organizationId: 'org-id',
        accessToken: 'token',
        trackingId: 'tracking',
        language: 'en',
        country: 'US',
        currency: 'USD',
        endpoint: 'https://platform.cloud.coveo.com',
      },
    });

    expect(readEndpointClientConfiguration(reader)).toEqual({
      organizationId: 'org-id',
      accessToken: 'token',
      endpoint: 'https://platform.cloud.coveo.com',
    });
  });

  it('reads conversation request defaults from state', () => {
    const reader = buildReader({
      configuration: {
        organizationId: 'org-id',
        accessToken: 'token',
        trackingId: 'tracking',
        language: 'en',
        country: 'US',
        currency: 'USD',
      },
    });

    expect(readConversationRequestDefaults(reader)).toEqual({
      trackingId: 'tracking',
      language: 'en',
      country: 'US',
      currency: 'USD',
    });
  });

  it('falls back to configuration initial state when slice is absent', () => {
    const reader = buildReader({});

    expect(readEndpointClientConfiguration(reader)).toEqual({
      organizationId: '',
      accessToken: '',
      endpoint: undefined,
    });
    expect(readConversationRequestDefaults(reader)).toEqual({
      trackingId: '',
      language: '',
      country: '',
      currency: '',
    });
  });
});
