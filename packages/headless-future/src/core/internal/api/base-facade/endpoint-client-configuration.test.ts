import {describe, expect, it} from 'vitest';
import {buildEndpointClientConfiguration} from './endpoint-client-configuration.js';

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

const buildEngine = (state: TestState) => {
  return {
    read: <T>(selector: (state: TestState) => T) => selector(state),
  };
};

describe('buildEndpointClientConfiguration', () => {
  it('returns transport configuration fields from the configuration slice', () => {
    const engine = buildEngine({
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

    expect(buildEndpointClientConfiguration(engine)).toEqual({
      organizationId: 'org-id',
      accessToken: 'token',
      endpoint: 'https://platform.cloud.coveo.com',
    });
  });

  it('falls back to initial configuration defaults when the slice is absent', () => {
    const engine = buildEngine({});

    expect(buildEndpointClientConfiguration(engine)).toEqual({
      organizationId: '',
      accessToken: '',
      endpoint: undefined,
    });
  });
});
