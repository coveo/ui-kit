import {describe, expect, it} from 'vitest';
import {actionCacheKey, createActionCache} from './action-cache.js';

const origin = {surfaceId: 'shell', sourceComponentId: 'instant-products', name: 'fetch'};

describe('actionCacheKey', () => {
  it('does not depend on the order of the payload keys', () => {
    expect(actionCacheKey(origin, {query: 'boots', page: {size: 4, index: 0}})).toBe(
      actionCacheKey(origin, {page: {index: 0, size: 4}, query: 'boots'})
    );
  });

  it('tells apart the origin, the action and the payload', () => {
    const key = actionCacheKey(origin, {query: 'boots'});

    expect(actionCacheKey(origin, {query: 'poles'})).not.toBe(key);
    expect(actionCacheKey({...origin, surfaceId: 'other'}, {query: 'boots'})).not.toBe(key);
    expect(actionCacheKey({...origin, sourceComponentId: 'other'}, {query: 'boots'})).not.toBe(key);
    expect(actionCacheKey({...origin, name: 'other'}, {query: 'boots'})).not.toBe(key);
  });
});

describe('createActionCache', () => {
  it('returns an entry until its lifetime ends', () => {
    let now = 0;
    const cache = createActionCache(() => now);
    const messages = [{updateDataModel: {}}];
    cache.set('key', messages, 1_000);

    now = 999;
    expect(cache.get('key')).toBe(messages);
    now = 1_000;
    expect(cache.get('key')).toBeUndefined();
  });

  it('holds 100 entries, and drops the least recently used first', () => {
    const cache = createActionCache(() => 0);
    for (let index = 0; index < 100; index += 1) {
      cache.set(`key-${index}`, [index], 1_000);
    }
    cache.get('key-0');

    cache.set('key-100', [100], 1_000);

    expect(cache.get('key-0')).toEqual([0]);
    expect(cache.get('key-1')).toBeUndefined();
    expect(cache.get('key-2')).toEqual([2]);
    expect(cache.get('key-100')).toEqual([100]);
  });
});
