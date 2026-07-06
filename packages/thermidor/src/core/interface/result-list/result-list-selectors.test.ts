import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getResults} from './result-list-selectors.js';
import {setResultsFromResponse} from './result-list-mutators.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('results selectors', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateResultsSlice(iface));
  });

  describe('getResults selector', () => {
    it('should return empty array initially', () => {
      expect(engine.read(getResults(iface))).toEqual([]);
    });
    it('should return updated results after mutation', () => {
      const results = [
        {
          uniqueId: '1',
          title: 'Test',
          uri: 'u',
          printableUri: 'p',
          clickUri: 'c',
          raw: {},
          score: 1,
        },
      ];
      engine.mutate(setResultsFromResponse(results as any, iface));
      expect(engine.read(getResults(iface))).toHaveLength(1);
    });
  });
});
