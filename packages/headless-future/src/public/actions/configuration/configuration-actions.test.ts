import {beforeEach, describe, expect, it} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import * as selectors from '@/src/core/interface/configuration/configuration-selectors.js';
import {loadConfigurationActions} from './configuration-actions.js';

describe('configuration actions', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
  });

  it('updates scalar configuration fields through actions', async () => {
    const actions = loadConfigurationActions(engine);
    await new Promise((r) => setTimeout(r, 0));

    actions.setTrackingId('track-123');
    actions.setLanguage('en');
    actions.setCountry('US');
    actions.setCurrency('USD');

    expect(engine.read(selectors.trackingId)).toBe('track-123');
    expect(engine.read(selectors.language)).toBe('en');
    expect(engine.read(selectors.country)).toBe('US');
    expect(engine.read(selectors.currency)).toBe('USD');
  });

  it('replaces configuration through setConfiguration', async () => {
    const actions = loadConfigurationActions(engine);
    await new Promise((r) => setTimeout(r, 0));

    actions.setConfiguration({
      organizationId: 'org-1',
      accessToken: 'token-1',
      trackingId: 'tracking-1',
      language: 'fr',
      country: 'CA',
      currency: 'CAD',
      endpoint: 'https://example.com',
    });

    expect(engine.read(selectors.organizationId)).toBe('org-1');
    expect(engine.read(selectors.accessToken)).toBe('token-1');
    expect(engine.read(selectors.trackingId)).toBe('tracking-1');
    expect(engine.read(selectors.language)).toBe('fr');
    expect(engine.read(selectors.country)).toBe('CA');
    expect(engine.read(selectors.currency)).toBe('CAD');
    expect(engine.read(selectors.endpoint)).toBe('https://example.com');
  });
});
