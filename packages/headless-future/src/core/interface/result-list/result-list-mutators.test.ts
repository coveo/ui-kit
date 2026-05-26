/**
 * Results Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import * as mutations from './result-list-mutators.js';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/test/test-utils.js';
import * as selectors from './result-list-selectors.js';
import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';

describe('resultsMutations', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(resultsSlice);
  });

  describe('setResults()', () => {
    it('should return StateMutation object', () => {
      const results = createMockSearchResults(2);
      const mutation = mutations.setResults(results);

      expect(mutation).toEqual({
        type: 'results/setResults',
        payload: results,
      });
    });

    it('should update state when used with mutate()', () => {
      const mockResults = createMockSearchResults(3);

      engine.mutate(mutations.setResults(mockResults));

      expect(engine.read(selectors.results)).toEqual(mockResults);
    });

    it('should accept empty array', () => {
      engine.mutate(mutations.setResults([]));

      expect(engine.read(selectors.results)).toEqual([]);
    });
  });

  describe('clearResults()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = mutations.clearResults();

      expect(mutation).toEqual({
        type: 'results/clearResults',
      });
    });

    it('should clear results when used with mutate()', () => {
      engine.mutate(mutations.setResults(createMockSearchResults(5)));
      engine.mutate(mutations.clearResults());

      expect(engine.read(selectors.results)).toEqual([]);
    });
  });

  describe('Integration: multiple mutations', () => {
    it('should work correctly in sequence', () => {
      engine.mutate(mutations.setResults(createMockSearchResults(3)));
      engine.mutate(mutations.clearResults());

      expect(engine.read(selectors.results)).toEqual([]);
    });
  });
});
