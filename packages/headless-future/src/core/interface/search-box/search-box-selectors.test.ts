/**
 * SearchBox Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as selectors from './search-box-selectors.js';
import * as mutations from './search-box-mutators.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';

describe('searchBox selectors', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
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
