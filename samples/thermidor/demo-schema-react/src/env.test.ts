import {describe, expect, it, vi, afterEach} from 'vitest';

const load = async (env: Record<string, string | undefined>) => {
  vi.resetModules();
  vi.stubGlobal('window', {location: {origin: 'http://localhost:5173'}});
  vi.stubEnv('DEV', false as never);
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v as string);
  const {getSampleConfiguration} = await import('./env.js');
  return getSampleConfiguration();
};

afterEach(() => vi.unstubAllEnvs());

const organizationSettings = {
  VITE_COVEO_TRACKING_ID: 'mine',
  VITE_COVEO_LANGUAGE: 'en',
  VITE_COVEO_COUNTRY: 'US',
  VITE_COVEO_CURRENCY: 'USD',
  VITE_COVEO_PLATFORM_ENVIRONMENT: 'dev',
};

/**
 * The public sample configuration applies as a bundle, keyed on the organization being
 * absent. These values are not independent — the token and tracking id belong to
 * `searchuisamples`, and it exists only in production — so a partial override must not
 * mix with it.
 */
describe('public sample configuration is a bundle', () => {
  it('applies wholesale with no organization', async () => {
    const c = await load({});
    expect(c.organizationId).toBe('searchuisamples');
    expect(c.trackingId).toBe('sports-ui-samples');
    expect(c.endpoint).toContain('https://searchuisamples.org.coveo.com');
  });

  it('IGNORES a stray platform environment (the reported bug)', async () => {
    const c = await load({VITE_COVEO_PLATFORM_ENVIRONMENT: 'dev'});
    expect(c.endpoint).toContain('https://searchuisamples.org.coveo.com');
    expect(c.endpoint).not.toContain('orgdev');
  });

  it('IGNORES a stray tracking id', async () => {
    const c = await load({VITE_COVEO_TRACKING_ID: 'someone-elses'});
    expect(c.trackingId).toBe('sports-ui-samples');
  });

  it('IGNORES a stray access token', async () => {
    const c = await load({VITE_COVEO_ACCESS_TOKEN: 'not-the-public-key'});
    expect(c.accessToken).toBe('xx564559b1-0045-48e1-953c-3addd1ee4457');
  });

  it('still honours transport settings without an organization (dev:agent-gateway)', async () => {
    const c = await load({VITE_COVEO_ENDPOINT: 'http://localhost:8990'});
    expect(c.endpoint).toBe(
      'http://localhost:8990/api/preview/organizations/searchuisamples/agents/commerce/agui/converse'
    );
  });

  it('opts out entirely once an organization is set', async () => {
    const c = await load({
      VITE_COVEO_ORGANIZATION_ID: 'myorg',
      VITE_COVEO_TRACKING_ID: 'mine',
      VITE_COVEO_LANGUAGE: 'fr',
      VITE_COVEO_COUNTRY: 'CA',
      VITE_COVEO_CURRENCY: 'CAD',
      VITE_COVEO_PLATFORM_ENVIRONMENT: 'dev',
    });
    expect(c.organizationId).toBe('myorg');
    expect(c.trackingId).toBe('mine');
    expect(c.accessToken).toBe('');
    expect(c.endpoint).toContain('https://myorg.orgdev.coveo.com');
  });
});

describe('the agent is a transport setting', () => {
  it('addresses the commerce agent by default', async () => {
    const c = await load({VITE_COVEO_ORGANIZATION_ID: 'myorg', ...organizationSettings});
    expect(c.endpoint).toBe(
      'https://myorg.orgdev.coveo.com/api/preview/organizations/myorg/agents/commerce/agui/converse'
    );
  });

  it('addresses the configured agent through the dev-server proxy', async () => {
    const c = await load({
      VITE_COVEO_ORGANIZATION_ID: 'myorg',
      ...organizationSettings,
      VITE_COVEO_USE_VITE_PROXY: 'true',
      VITE_COVEO_AGENT: 'question-answering',
    });
    expect(c.endpoint).toBe(
      'http://localhost:5173/api/preview/organizations/myorg/agents/question-answering/agui/converse'
    );
  });

  it('is honoured without an organization', async () => {
    const c = await load({VITE_COVEO_AGENT: 'question-answering'});
    expect(c.endpoint).toContain('/organizations/searchuisamples/agents/question-answering/');
  });

  it('refuses an agent that is not a path segment', async () => {
    await expect(load({VITE_COVEO_AGENT: 'commerce/agui'})).rejects.toThrow(/VITE_COVEO_AGENT/);
  });
});
