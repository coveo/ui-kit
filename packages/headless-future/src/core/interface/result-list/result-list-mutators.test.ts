/**
 * Results Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {clearResults, setResults} from './result-list-mutators.js';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/test/test-utils.js';
import {results as selectResults} from './result-list-selectors.js';
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
      const mutation = setResults(results);

      expect(mutation).toEqual({
        type: 'results/setResults',
        payload: results,
      });
    });

    it('should update state when used with mutate()', () => {
      const mockResults = createMockSearchResults(3);

      engine.mutate(setResults(mockResults));

      expect(engine.read(selectResults)).toEqual(mockResults);
    });

    it('should accept empty array', () => {
      engine.mutate(setResults([]));

      expect(engine.read(selectResults)).toEqual([]);
    });
  });

  describe('clearResults()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = clearResults();

      expect(mutation).toEqual({
        type: 'results/clearResults',
      });
    });

    it('should clear results when used with mutate()', () => {
      engine.mutate(setResults(createMockSearchResults(5)));
      engine.mutate(clearResults());

      expect(engine.read(selectResults)).toEqual([]);
    });
  });

  describe('Integration: multiple mutations', () => {
    it('should work correctly in sequence', () => {
      engine.mutate(setResults(createMockSearchResults(3)));
      engine.mutate(clearResults());

      expect(engine.read(selectResults)).toEqual([]);
    });
  });
});
