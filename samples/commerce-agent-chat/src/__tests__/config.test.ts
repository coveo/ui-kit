import {beforeEach, describe, expect, it, vi} from 'vitest';

import {loadConfig} from '../config/env.js';

describe('loadConfig', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('loads valid config from env vars', () => {
    vi.stubEnv('VITE_AGENT_MODE', 'local');
    vi.stubEnv('VITE_AGENT_URL', 'http://localhost:8080');
    vi.stubEnv('VITE_ORG_ID', 'test-org');
    vi.stubEnv('VITE_ACCESS_TOKEN', 'test-token');
    vi.stubEnv('VITE_PLATFORM_URL', 'https://platform.cloud.coveo.com');
    vi.stubEnv('VITE_TRACKING_ID', 'test-tracking');
    vi.stubEnv('VITE_LANGUAGE', 'en');
    vi.stubEnv('VITE_COUNTRY', 'US');
    vi.stubEnv('VITE_CURRENCY', 'USD');
    vi.stubEnv('VITE_TIMEZONE', 'America/Montreal');
    vi.stubEnv('VITE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('VITE_CONTEXT_URL', 'https://example.com');

    const config = loadConfig();

    expect(config.agentUrl).toBe('http://localhost:8080');
    expect(config.orgId).toBe('test-org');
  });

  it('throws when required env vars are missing', () => {
    vi.stubEnv('VITE_AGENT_MODE', 'local');
    vi.stubEnv('VITE_AGENT_URL', '');
    vi.stubEnv('VITE_ORG_ID', 'test-org');
    vi.stubEnv('VITE_ACCESS_TOKEN', 'test-token');
    vi.stubEnv('VITE_PLATFORM_URL', 'https://platform.cloud.coveo.com');
    vi.stubEnv('VITE_TRACKING_ID', 'test-tracking');
    vi.stubEnv('VITE_LANGUAGE', 'en');
    vi.stubEnv('VITE_COUNTRY', 'US');
    vi.stubEnv('VITE_CURRENCY', 'USD');
    vi.stubEnv('VITE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('VITE_CONTEXT_URL', 'https://example.com');

    expect(() => loadConfig()).toThrow(/VITE_AGENT_URL/);
  });

  it('uses a proxied coveo-dev URL during local dev', () => {
    vi.stubEnv('VITE_AGENT_MODE', 'coveo-dev');
    vi.stubEnv('VITE_ORG_ID', 'test-org');
    vi.stubEnv('VITE_ACCESS_TOKEN', 'test-token');
    vi.stubEnv('VITE_PLATFORM_URL', 'https://platformdev.cloud.coveo.com');
    vi.stubEnv('VITE_TRACKING_ID', 'test-tracking');
    vi.stubEnv('VITE_LANGUAGE', 'en');
    vi.stubEnv('VITE_COUNTRY', 'US');
    vi.stubEnv('VITE_CURRENCY', 'USD');
    vi.stubEnv('VITE_TIMEZONE', 'America/Montreal');
    vi.stubEnv('VITE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('VITE_CONTEXT_URL', 'https://example.com');

    const config = loadConfig();

    expect(config.agentUrl).toBe(
      '/api/coveo-dev/rest/organizations/test-org/commerce/unstable/agentic/converse'
    );
  });
});
