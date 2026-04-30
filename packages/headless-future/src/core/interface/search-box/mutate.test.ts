/**
 * SearchBox Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import * as mutations from './mutate.js';
import {createTestEngine} from '@/src/core/test-utils.js';
import * as selectors from './selectors.js';
import {searchBoxSlice} from '@/src/core/internal/searchBox/slice.js';
import {Engine} from '@/src/core/interface/engine/engine.js';

describe('searchBoxMutations', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
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

      expect(engine.read(selectors.query)).toBe('test query');
    });

    it('should accept empty string', () => {
      engine.mutate(mutations.setQuery(''));

      expect(engine.read(selectors.query)).toBe('');
    });
  });
});
