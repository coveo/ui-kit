import {beforeEach, describe, expect, it} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  getFullEngine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';
import {navigatorContextSlice} from '@/src/core/internal/navigator-context/navigator-context-slice.js';
import * as mutators from './navigator-context-mutators.js';
import * as selectors from './navigator-context-selectors.js';

describe('navigator-context mutators', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(navigatorContextSlice);
  });

  it('updates client and browsing metadata', () => {
    engine.mutate(mutators.setClientId('client-1'));
    engine.mutate(mutators.setUrl('https://example.com'));
    engine.mutate(mutators.setReferrer('https://google.com'));
    engine.mutate(mutators.setUserAgent('agent'));

    expect(engine.read(selectors.clientId)).toBe('client-1');
    expect(engine.read(selectors.url)).toBe('https://example.com');
    expect(engine.read(selectors.referrer)).toBe('https://google.com');
    expect(engine.read(selectors.userAgent)).toBe('agent');
  });
});
