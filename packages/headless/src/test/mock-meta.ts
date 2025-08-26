import type {Meta} from '@coveo/relay';

export const buildMockMeta = (config: Partial<Meta>): Meta => {
  return {
    type: '',
    config: {trackingId: null},
    ts: 0,
    source: [],
    clientId: '',
    userAgent: null,
    referrer: null,
    location: null,
    ...config,
  };
};
