/**
 * Results Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/test/test-utils.js';
import * as selectors from './result-list-selectors.js';
import * as mutations from './result-list-mutators.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';

describe('results selectors', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(resultsSlice);
  });

  describe('results selector', () => {
    it('should return empty array initially', () => {
      const results = engine.read(selectors.results);
      expect(results).toEqual([]);
    });

    it('should return updated results after mutation', () => {
      const mockResults = createMockSearchResults(3);
      engine.mutate(mutations.setResults(mockResults));

      const results = engine.read(selectors.results);
      expect(results).toEqual(mockResults);
      expect(results.length).toBe(3);
    });
  });

  describe('hasSearchResults selector', () => {
    it('should return false when no results', () => {
      const hasResults = engine.read(selectors.hasSearchResults);
      expect(hasResults).toBe(false);
    });

    it('should return true when results are present', () => {
      engine.mutate(mutations.setResults(createMockSearchResults(2)));
      const hasResults = engine.read(selectors.hasSearchResults);
      expect(hasResults).toBe(true);
    });
  });
});
