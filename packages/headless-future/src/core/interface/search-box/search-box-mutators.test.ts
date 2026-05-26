/**
 * SearchBox Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import * as mutations from './search-box-mutators.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as selectors from './search-box-selectors.js';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';

describe('searchBoxMutations', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(searchBoxSlice);
  });

  describe('setQuery()', () => {
    it('should return StateMutation object', () => {
      const mutation = mutations.setQuery('laptops');

      expect(mutation).toEqual({
        type: 'searchBox/setQuery',
        payload: 'laptops',
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(mutations.setQuery('test query'));

      expect(engine.read(selectors.getQuery)).toBe('test query');
    });

    it('should accept empty string', () => {
      engine.mutate(mutations.setQuery(''));

      expect(engine.read(selectors.getQuery)).toBe('');
    });
  });
});
