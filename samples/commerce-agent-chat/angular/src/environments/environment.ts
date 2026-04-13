// This file is deprecated. Configuration is now loaded at runtime from public/config.json
// See scripts/generate-config.mjs for details.

import type {CommerceConfig} from '@core/config/env.js';

export const environment: {production: boolean; config: CommerceConfig} = {
  production: false,
  config: {
    agentMode: 'local',
    agentUrl: '/api',
    orgId: '',
    accessToken: '',
    platformUrl: '',
    trackingId: '',
    language: 'en',
    country: 'US',
    currency: 'USD',
    timezone: 'America/Montreal',
    clientId: '',
    contextUrl: 'https://example.com',
  },
};
