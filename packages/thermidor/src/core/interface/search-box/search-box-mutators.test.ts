/**
 * SearchBox Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {setQuery} from './search-box-mutators.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getQuery} from './search-box-selectors.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';
import {Engine} from '@/src/core/interface/engine/engine.js';

describe('searchBoxMutations', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateSearchBoxSlice(iface));
  });

  describe('setQuery()', () => {
    it('should return StateMutation object', () => {
      const mutation = setQuery('laptops', iface);

      expect(mutation).toEqual({
        type: 'default/searchBox/setQuery',
        payload: 'laptops',
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setQuery('test query', iface));

      expect(engine.read(getQuery(iface))).toBe('test query');
    });

    it('should accept empty string', () => {
      engine.mutate(setQuery('', iface));

      expect(engine.read(getQuery(iface))).toBe('');
    });
  });
});
