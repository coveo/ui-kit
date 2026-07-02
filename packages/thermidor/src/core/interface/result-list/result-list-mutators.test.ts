import {describe, it, expect, beforeEach} from 'vitest';
import {
  createTestEngine,
  createTestInterface,
  createMockSearchResult,
} from '@/src/test/test-utils.js';
import {setResultsFromResponse} from './result-list-mutators.js';
import {getResults} from './result-list-selectors.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('resultsMutations', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateResultsSlice(iface));
  });

  describe('setResultsFromResponse()', () => {
    it('should return StateMutation object', () => {
      const mutation = setResultsFromResponse([], iface);
      expect(mutation).toHaveProperty('type');
      expect(mutation).toHaveProperty('payload');
    });
    it('should update state when used with mutate()', () => {
      const results = [createMockSearchResult()];
      engine.mutate(setResultsFromResponse(results, iface));
      expect(engine.read(getResults(iface))).toHaveLength(1);
    });
    it('should accept empty array', () => {
      engine.mutate(setResultsFromResponse([], iface));
      expect(engine.read(getResults(iface))).toEqual([]);
    });
  });

  describe('Integration: multiple mutations', () => {
    it('should work correctly in sequence', () => {
      engine.mutate(setResultsFromResponse([createMockSearchResult()], iface));
      engine.mutate(setResultsFromResponse([], iface));
      expect(engine.read(getResults(iface))).toEqual([]);
    });
  });
});
