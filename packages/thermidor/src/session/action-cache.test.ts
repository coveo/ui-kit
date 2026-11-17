import {describe, expect, it} from 'vitest';
import {actionCacheKey, createActionCache} from './action-cache.js';

const origin = {surfaceId: 'shell', sourceComponentId: 'instant-products', name: 'fetch'};
const locale = {language: 'en', country: 'US', currency: 'USD'};
const keyOf = (o: typeof origin, payload: unknown) => actionCacheKey(o, payload, locale);

describe('actionCacheKey', () => {
  it('does not depend on the order of the payload keys', () => {
    expect(keyOf(origin, {query: 'boots', page: {size: 4, index: 0}})).toBe(
      keyOf(origin, {page: {index: 0, size: 4}, query: 'boots'})
    );
  });

  it('tells apart payloads whose request JSON differs', () => {
    expect(keyOf(origin, {since: new Date(0)})).not.toBe(keyOf(origin, {since: new Date(1)}));
    // oxlint-disable-next-line no-sparse-arrays
    expect(keyOf(origin, {ids: [, 'a']})).not.toBe(keyOf(origin, {ids: ['a']}));
    // oxlint-disable-next-line no-sparse-arrays
    expect(keyOf(origin, {ids: [,]})).toBe(keyOf(origin, {ids: [null]}));
  });

  it('tells apart the origin, the action and the payload', () => {
    const key = keyOf(origin, {query: 'boots'});

    expect(keyOf(origin, {query: 'poles'})).not.toBe(key);
    expect(keyOf({...origin, surfaceId: 'other'}, {query: 'boots'})).not.toBe(key);
    expect(keyOf({...origin, sourceComponentId: 'other'}, {query: 'boots'})).not.toBe(key);
    expect(keyOf({...origin, name: 'other'}, {query: 'boots'})).not.toBe(key);
  });

  it('tells apart each part of the locale', () => {
    const key = keyOf(origin, {query: 'boots'});

    for (const part of [{language: 'fr'}, {country: 'CA'}, {currency: 'CAD'}]) {
      expect(actionCacheKey(origin, {query: 'boots'}, {...locale, ...part})).not.toBe(key);
    }
  });
});

describe('createActionCache', () => {
  it('returns an entry while it is younger than the lifetime it is read with', () => {
    let now = 0;
    const cache = createActionCache(() => now);
    const messages = [{updateDataModel: {}}];
    cache.set('key', messages);

    now = 999;
    expect(cache.get('key', 1_000)).toBe(messages);
    now = 1_000;
    expect(cache.get('key', 1_000)).toBeUndefined();
  });

  it('honors a lifetime shorter than the one an entry was cached under', () => {
    let now = 0;
    const cache = createActionCache(() => now);
    cache.set('key', [{updateDataModel: {}}]);

    now = 500;
    expect(cache.get('key', 500)).toBeUndefined();
  });

  it('holds 100 entries, and drops the least recently used first', () => {
    const cache = createActionCache(() => 0);
    for (let index = 0; index < 100; index += 1) {
      cache.set(`key-${index}`, [index]);
    }
    cache.get('key-0', 1_000);

    cache.set('key-100', [100]);

    expect(cache.get('key-0', 1_000)).toEqual([0]);
    expect(cache.get('key-1', 1_000)).toBeUndefined();
    expect(cache.get('key-2', 1_000)).toEqual([2]);
    expect(cache.get('key-100', 1_000)).toEqual([100]);
  });
});
