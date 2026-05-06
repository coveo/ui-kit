import {beforeEach, describe, expect, it} from 'vitest';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as selectors from '@/src/core/interface/navigator-context/navigator-context-selectors.js';
import {loadNavigatorContextActions} from './navigator-context-actions.js';

describe('navigator-context actions', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
  });

  it('updates navigator context state', async () => {
    const actions = loadNavigatorContextActions(engine);
    await new Promise((r) => setTimeout(r, 0));

    actions.setClientId('client-1');
    actions.setUrl('https://example.com');
    actions.setReferrer('https://google.com');
    actions.setUserAgent('agent');

    expect(engine.read(selectors.clientId)).toBe('client-1');
    expect(engine.read(selectors.url)).toBe('https://example.com');
    expect(engine.read(selectors.referrer)).toBe('https://google.com');
    expect(engine.read(selectors.userAgent)).toBe('agent');
  });
});
