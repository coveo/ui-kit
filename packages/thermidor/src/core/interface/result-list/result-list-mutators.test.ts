/**
 * Results Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {setResultsFromResponse} from './result-list-mutators.js';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/test/test-utils.js';
import {getResults} from './result-list-selectors.js';
import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';

describe('resultsMutations', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(getOrCreateResultsSlice('default'));
  });

  describe('setResultsFromResponse()', () => {
    it('should return StateMutation object', () => {
      const results = createMockSearchResults(2);
      const mutation = setResultsFromResponse(results);

      expect(mutation).toEqual({
        type: 'default/results/setResultsFromResponse',
        payload: results,
      });
    });

    it('should update state when used with mutate()', () => {
      const mockResults = createMockSearchResults(3);

      engine.mutate(setResultsFromResponse(mockResults));

      const selectResults = getResults();
      expect(engine.read(selectResults)).toHaveLength(3);
      expect(engine.read(selectResults)[0].uniqueId).toBe(
        mockResults[0].uniqueId
      );
    });

    it('should accept empty array', () => {
      engine.mutate(setResultsFromResponse([]));

      const selectResults = getResults();
      expect(engine.read(selectResults)).toEqual([]);
    });
  });

  describe('Integration: multiple mutations', () => {
    it('should work correctly in sequence', () => {
      engine.mutate(setResultsFromResponse(createMockSearchResults(3)));
      engine.mutate(setResultsFromResponse([]));

      const selectResults = getResults();
      expect(engine.read(selectResults)).toEqual([]);
    });
  });
});
