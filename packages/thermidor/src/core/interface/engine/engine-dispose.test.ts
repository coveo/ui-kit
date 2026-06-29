/**
 * Engine.dispose() Unit Tests
 *
 * Property 7: Disposed engine rejects all operations
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {Engine, getFullEngine, FullEngine} from './engine.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {getQuery} from '@/src/core/interface/search-box/search-box-selectors.js';
import {setQuery} from '@/src/core/interface/search-box/search-box-mutators.js';

describe('Engine.dispose()', () => {
  let engine: Engine;
  let fullEngine: FullEngine;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
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

    expect(() => fullEngine.mutate(setQuery('test'))).toThrow(
      'Cannot operate on a disposed Engine.'
    );
  });

  it('read throws after dispose', () => {
    engine.dispose();

    expect(() => fullEngine.read(getQuery)).toThrow(
      'Cannot operate on a disposed Engine.'
    );
  });

  it('subscribe throws after dispose', () => {
    engine.dispose();

    expect(() => fullEngine.subscribe(getQuery, () => {})).toThrow(
      'Cannot operate on a disposed Engine.'
    );
  });

  it('adoptSlice throws after dispose', async () => {
    engine.dispose();

    await expect(
      fullEngine.adoptSlice(getOrCreateSearchBoxSlice('test'))
    ).rejects.toThrow('Cannot operate on a disposed Engine.');
  });

  it('all operations work normally before dispose', async () => {
    await fullEngine.adoptSlice(getOrCreateSearchBoxSlice('default'));
    fullEngine.mutate(setQuery('hello'));
    const query = fullEngine.read(getQuery);
    const unsubscribe = fullEngine.subscribe(getQuery, () => {});

    expect(query).toBe('hello');
    expect(typeof unsubscribe).toBe('function');

    unsubscribe();
  });
});
