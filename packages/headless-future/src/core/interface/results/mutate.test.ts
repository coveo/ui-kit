/**
 * Results Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import * as mutations from './mutate.js';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/core/test-utils.js';
import * as selectors from './selectors.js';
import {resultsSlice} from '@/src/core/internal/results/slice.js';
import {Engine} from '@/src/core/interface/engine/engine.js';

describe('resultsMutations', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
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

  describe('setLoading()', () => {
    it('should return StateMutation object for true', () => {
      const mutation = mutations.setLoading(true);

      expect(mutation).toEqual({
        type: 'results/setLoading',
        payload: true,
      });
    });

    it('should return StateMutation object for false', () => {
      const mutation = mutations.setLoading(false);

      expect(mutation).toEqual({
        type: 'results/setLoading',
        payload: false,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(mutations.setLoading(true));
      expect(engine.read(selectors.isLoading)).toBe(true);

      engine.mutate(mutations.setLoading(false));
      expect(engine.read(selectors.isLoading)).toBe(false);
    });
  });

  describe('setError()', () => {
    it('should return StateMutation object with error message', () => {
      const mutation = mutations.setError('Search failed');

      expect(mutation).toEqual({
        type: 'results/setError',
        payload: 'Search failed',
      });
    });

    it('should return StateMutation object with null', () => {
      const mutation = mutations.setError(null);

      expect(mutation).toEqual({
        type: 'results/setError',
        payload: null,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(mutations.setError('Error occurred'));

      expect(engine.read(selectors.error)).toBe('Error occurred');
    });

    it('should clear error with null', () => {
      engine.mutate(mutations.setError('Some error'));
      engine.mutate(mutations.setError(null));

      expect(engine.read(selectors.error)).toBeNull();
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

    it('should clear error when used with mutate()', () => {
      engine.mutate(mutations.setError('Some error'));
      engine.mutate(mutations.clearResults());

      expect(engine.read(selectors.error)).toBeNull();
    });

    it('should preserve loading state', () => {
      engine.mutate(mutations.setLoading(true));
      engine.mutate(mutations.clearResults());

      expect(engine.read(selectors.isLoading)).toBe(true);
    });
  });

  describe('Integration: multiple mutations', () => {
    it('should work correctly in sequence', () => {
      engine.mutate(mutations.setResults(createMockSearchResults(3)));
      engine.mutate(mutations.setLoading(false));

      expect(engine.read(selectors.results).length).toBe(3);
      expect(engine.read(selectors.isLoading)).toBe(false);
      expect(engine.read(selectors.error)).toBeNull();
    });

    it('should handle error flow', () => {
      engine.mutate(mutations.setLoading(true));
      engine.mutate(mutations.setError('API error'));
      engine.mutate(mutations.setLoading(false));

      expect(engine.read(selectors.error)).toBe('API error');
      expect(engine.read(selectors.isLoading)).toBe(false);
    });
  });
});
