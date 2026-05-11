import {beforeEach, describe, expect, it} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  Engine,
  FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import * as selectors from '@/src/core/interface/configuration/configuration-selectors.js';
import {loadConfigurationActions} from './configuration-actions.js';

describe('configuration actions', () => {
  let engine: Engine;
  let fullEngine: FullEngine;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
  });

  it('updates scalar configuration fields through actions', async () => {
    const actions = loadConfigurationActions(engine);
    await new Promise((r) => setTimeout(r, 0));

    actions.setTrackingId('track-123');
    actions.setLanguage('en');
    actions.setCountry('US');
    actions.setCurrency('USD');

    expect(fullEngine.read(selectors.trackingId)).toBe('track-123');
    expect(fullEngine.read(selectors.language)).toBe('en');
    expect(fullEngine.read(selectors.country)).toBe('US');
    expect(fullEngine.read(selectors.currency)).toBe('USD');
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

    expect(fullEngine.read(selectors.organizationId)).toBe('org-1');
    expect(fullEngine.read(selectors.accessToken)).toBe('token-1');
    expect(fullEngine.read(selectors.trackingId)).toBe('tracking-1');
    expect(fullEngine.read(selectors.language)).toBe('fr');
    expect(fullEngine.read(selectors.country)).toBe('CA');
    expect(fullEngine.read(selectors.currency)).toBe('CAD');
    expect(fullEngine.read(selectors.endpoint)).toBe('https://example.com');
  });
});
