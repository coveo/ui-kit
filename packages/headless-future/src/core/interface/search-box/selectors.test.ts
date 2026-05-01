/**
 * SearchBox Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/core/test-utils.js';
import * as selectors from './selectors.js';
import * as mutations from './mutate.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {searchBoxSlice} from '@/src/core/internal/searchBox/slice.js';

describe('searchBox selectors', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(searchBoxSlice);
  });

  describe('query selector', () => {
    it('should return empty string initially', () => {
      const query = engine.read(selectors.query);
      expect(query).toBe('');
    });

    it('should return updated query after mutation', () => {
      engine.mutate(mutations.setQuery('laptops'));
      const query = engine.read(selectors.query);
      expect(query).toBe('laptops');
    });
  });
});
