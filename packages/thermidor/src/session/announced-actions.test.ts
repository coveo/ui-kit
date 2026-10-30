import {describe, expect, it} from 'vitest';
import {cachePolicy, isConcurrentAction} from './announced-actions.js';
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
const cached = (cachedActions: unknown) => snapshot({cachedActions});

const ONE_MINUTE = {ttlMs: 60_000};

describe('isConcurrentAction', () => {
  it('reads the actions the producer announces for the surface', () => {
    const activities = [concurrent({shell: ['fetchInstantProducts']})];

    expect(isConcurrentAction(activities, 'shell', 'fetchInstantProducts')).toBe(true);
    expect(isConcurrentAction(activities, 'shell', 'fetchSuggestions')).toBe(false);
    expect(isConcurrentAction(activities, 'other', 'fetchInstantProducts')).toBe(false);
  });

  it('keeps the latest announcement for the surface, and an empty one revokes it', () => {
    const activities = [concurrent({shell: ['fetchInstantProducts']}), concurrent({shell: []})];

    expect(isConcurrentAction(activities, 'shell', 'fetchInstantProducts')).toBe(false);
  });

  it('keeps an earlier announcement when a later snapshot says nothing about the surface', () => {
    const activities = [
      concurrent({shell: ['fetchInstantProducts']}),
      snapshot(),
      concurrent({other: []}),
    ];

    expect(isConcurrentAction(activities, 'shell', 'fetchInstantProducts')).toBe(true);
  });

  it('ignores an announcement that does not have the expected shape', () => {
    const valid = concurrent({shell: ['fetchInstantProducts']});

    expect(isConcurrentAction([concurrent('fetchInstantProducts')], 'shell', 'x')).toBe(false);
    expect(
      isConcurrentAction(
        [valid, concurrent({shell: 'fetchInstantProducts'})],
        'shell',
        'fetchInstantProducts'
      )
    ).toBe(true);
    expect(
      isConcurrentAction(
        [valid, concurrent({shell: ['fetchInstantProducts', 42]})],
        'shell',
        'fetchInstantProducts'
      )
    ).toBe(true);
  });
});

describe('cachePolicy', () => {
  const concurrentProducts = concurrent({shell: ['fetchInstantProducts']});

  it('reads the policy the producer announces for a concurrent action', () => {
    const activities = [concurrentProducts, cached({shell: {fetchInstantProducts: ONE_MINUTE}})];

    expect(cachePolicy(activities, 'shell', 'fetchInstantProducts')).toEqual(ONE_MINUTE);
    expect(cachePolicy(activities, 'other', 'fetchInstantProducts')).toBeUndefined();
  });

  it('ignores a policy for an action not announced as concurrent', () => {
    const activities = [cached({shell: {fetchInstantProducts: ONE_MINUTE}})];

    expect(cachePolicy(activities, 'shell', 'fetchInstantProducts')).toBeUndefined();
  });

  it('ignores a policy once the action is no longer concurrent', () => {
    const activities = [
      concurrentProducts,
      cached({shell: {fetchInstantProducts: ONE_MINUTE}}),
      concurrent({shell: []}),
    ];

    expect(cachePolicy(activities, 'shell', 'fetchInstantProducts')).toBeUndefined();
  });

  it('keeps the latest announcement for the surface, and an empty one revokes it', () => {
    const later = {ttlMs: 5_000};

    expect(
      cachePolicy(
        [
          concurrentProducts,
          cached({shell: {fetchInstantProducts: ONE_MINUTE}}),
          cached({shell: {fetchInstantProducts: later}}),
        ],
        'shell',
        'fetchInstantProducts'
      )
    ).toEqual(later);
    expect(
      cachePolicy(
        [
          concurrentProducts,
          cached({shell: {fetchInstantProducts: ONE_MINUTE}}),
          cached({shell: {}}),
        ],
        'shell',
        'fetchInstantProducts'
      )
    ).toBeUndefined();
  });

  it('ignores an announcement that does not have the expected shape', () => {
    for (const malformed of [
      {shell: ['fetchInstantProducts']},
      {shell: {fetchInstantProducts: 60_000}},
      {shell: {fetchInstantProducts: {ttlMs: '60000'}}},
      {shell: {fetchInstantProducts: {ttlMs: -1}}},
      {shell: {fetchInstantProducts: ONE_MINUTE, other: {}}},
    ]) {
      const activities = [
        concurrentProducts,
        cached({shell: {fetchInstantProducts: ONE_MINUTE}}),
        cached(malformed),
      ];

      expect(cachePolicy(activities, 'shell', 'fetchInstantProducts')).toEqual(ONE_MINUTE);
    }
  });
});
