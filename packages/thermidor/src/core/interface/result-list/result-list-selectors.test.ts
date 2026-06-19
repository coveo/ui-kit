/**
 * Results Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/test/test-utils.js';
import {getResults} from './result-list-selectors.js';
import {setResultsFromResponse} from './result-list-mutators.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';

describe('results selectors', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(getOrCreateResultsSlice('default'));
  });

  describe('getResults selector', () => {
    it('should return empty array initially', () => {
      const selectResults = getResults();
      const results = engine.read(selectResults);
      expect(results).toEqual([]);
    });

    it('should return updated results after mutation', () => {
      const mockResults = createMockSearchResults(3);
      engine.mutate(setResultsFromResponse(mockResults));

      const selectResults = getResults();
      const results = engine.read(selectResults);
      expect(results).toHaveLength(3);
      expect(results[0].uniqueId).toBe(mockResults[0].uniqueId);
    });
  });
});
