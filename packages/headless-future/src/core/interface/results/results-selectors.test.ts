/**
 * Results Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/test/test-utils.js';
import * as selectors from './results-selectors.js';
import * as mutations from './results-mutators.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {resultsSlice} from '@/src/core/internal/results/results-slice.js';

describe('results selectors', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
    engine.adoptSlice(resultsSlice);
  });

  describe('results selector', () => {
    it('should return empty array initially', () => {
      const results = engine.read(selectors.results);
      expect(results).toEqual([]);
    });

    it('should return updated results after mutation', () => {
      const mockResults = createMockSearchResults(3);
      mutations.setResults(engine, mockResults);

      const results = engine.read(selectors.results);
      expect(results).toEqual(mockResults);
      expect(results.length).toBe(3);
    });
  });

  describe('isLoading selector', () => {
    it('should return false initially', () => {
      const isLoading = engine.read(selectors.isLoading);
      expect(isLoading).toBe(false);
    });

    it('should return true when loading', () => {
      mutations.setLoading(engine, true);
      const isLoading = engine.read(selectors.isLoading);
      expect(isLoading).toBe(true);
    });
  });

  describe('error selector', () => {
    it('should return null initially', () => {
      const error = engine.read(selectors.error);
      expect(error).toBeNull();
    });

    it('should return error message when set', () => {
      mutations.setError(engine, 'Search failed');
      const error = engine.read(selectors.error);
      expect(error).toBe('Search failed');
    });
  });

  describe('hasSearchResults selector', () => {
    it('should return false when no results', () => {
      const hasResults = engine.read(selectors.hasSearchResults);
      expect(hasResults).toBe(false);
    });

    it('should return true when results are present', () => {
      mutations.setResults(engine, createMockSearchResults(2));
      const hasResults = engine.read(selectors.hasSearchResults);
      expect(hasResults).toBe(true);
    });
  });
});
