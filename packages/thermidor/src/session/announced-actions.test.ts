import {describe, expect, it} from 'vitest';
import {concurrentAction} from './announced-actions.js';
import type {Activity} from './types.js';

function snapshot(metadata?: Record<string, unknown>): Activity {
  return {
    id: 'activity',
    kind: 'a2ui-surface',
    replace: true,
    payload: {messages: []},
    ...(metadata && {metadata}),
  };
}

const concurrent = (concurrentActions: unknown) => snapshot({concurrentActions});

const ONE_MINUTE = {ttlMs: 60_000};
const CACHED_PRODUCTS = {fetchInstantProducts: {cache: ONE_MINUTE}};

describe('concurrentAction', () => {
  it('reads the actions the producer announces for the surface, with their cache policy', () => {
    const activities = [concurrent({shell: {...CACHED_PRODUCTS, logClick: {}}})];

    expect(concurrentAction(activities, 'shell', 'fetchInstantProducts')).toEqual({
      cache: ONE_MINUTE,
    });
    expect(concurrentAction(activities, 'shell', 'logClick')).toEqual({});
    expect(concurrentAction(activities, 'shell', 'fetchSuggestions')).toBeUndefined();
    expect(concurrentAction(activities, 'other', 'fetchInstantProducts')).toBeUndefined();
  });

  it('keeps the latest announcement for the surface, and an empty one revokes it', () => {
    const later = {fetchInstantProducts: {cache: {ttlMs: 5_000}}};

    expect(
      concurrentAction(
        [concurrent({shell: CACHED_PRODUCTS}), concurrent({shell: later})],
        'shell',
        'fetchInstantProducts'
      )
    ).toEqual(later.fetchInstantProducts);
    expect(
      concurrentAction(
        [concurrent({shell: CACHED_PRODUCTS}), concurrent({shell: {fetchInstantProducts: {}}})],
        'shell',
        'fetchInstantProducts'
      )
    ).toEqual({});
    expect(
      concurrentAction(
        [concurrent({shell: CACHED_PRODUCTS}), concurrent({shell: {}})],
        'shell',
        'fetchInstantProducts'
      )
    ).toBeUndefined();
  });

  it('keeps an earlier announcement when a later snapshot says nothing about the surface', () => {
    const activities = [concurrent({shell: CACHED_PRODUCTS}), snapshot(), concurrent({other: {}})];

    expect(concurrentAction(activities, 'shell', 'fetchInstantProducts')).toEqual({
      cache: ONE_MINUTE,
    });
  });

  it('ignores an announcement that does not have the expected shape', () => {
    for (const malformed of [
      'fetchInstantProducts',
      {shell: ['fetchInstantProducts']},
      {shell: {fetchInstantProducts: true}},
      {shell: {fetchInstantProducts: {cache: 60_000}}},
      {shell: {fetchInstantProducts: {cache: {ttlMs: '60000'}}}},
      {shell: {fetchInstantProducts: {cache: {ttlMs: -1}}}},
      {shell: {...CACHED_PRODUCTS, other: null}},
    ]) {
      const activities = [concurrent({shell: CACHED_PRODUCTS}), concurrent(malformed)];

      expect(concurrentAction(activities, 'shell', 'fetchInstantProducts')).toEqual({
        cache: ONE_MINUTE,
      });
    }
  });
});
