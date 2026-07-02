/**
 * Engine.dispose() Unit Tests
 *
 * Property 7: Disposed engine rejects all operations
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {Engine, getFullEngine, FullEngine} from './engine.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {getQuery} from '@/src/core/interface/search-box/search-box-selectors.js';
import {setQuery} from '@/src/core/interface/search-box/search-box-mutators.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('Engine.dispose()', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    iface = createTestInterface(engine, 'default');
  });

  it('disposed returns false before dispose', () => {
    expect(engine.disposed).toBe(false);
  });

  it('disposed returns true after dispose', () => {
    engine.dispose();

    expect(engine.disposed).toBe(true);
  });

  it('mutate throws after dispose', () => {
    engine.dispose();

    expect(() => fullEngine.mutate(setQuery('test', iface))).toThrow();
  });

  it('read throws after dispose', () => {
    engine.dispose();

    expect(() => fullEngine.read(getQuery(iface))).toThrow();
  });

  it('subscribe throws after dispose', () => {
    engine.dispose();

    expect(() => fullEngine.subscribe(getQuery(iface), () => {})).toThrow();
  });

  it('adoptSlice throws after dispose', async () => {
    const slice = getOrCreateSearchBoxSlice(iface);
    engine.dispose();

    await expect(fullEngine.adoptSlice(slice)).rejects.toThrow(
      'Cannot operate on a disposed Engine.'
    );
  });

  it('all operations work normally before dispose', async () => {
    await fullEngine.adoptSlice(getOrCreateSearchBoxSlice(iface));
    fullEngine.mutate(setQuery('hello', iface));
    const query = fullEngine.read(getQuery(iface));
    const unsubscribe = fullEngine.subscribe(getQuery(iface), () => {});

    expect(query).toBe('hello');
    expect(typeof unsubscribe).toBe('function');

    unsubscribe();
  });
});
