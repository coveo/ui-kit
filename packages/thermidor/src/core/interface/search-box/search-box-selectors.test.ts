/**
 * SearchBox Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getQuery} from './search-box-selectors.js';
import {setQuery} from './search-box-mutators.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('searchBox selectors', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateSearchBoxSlice(iface));
  });

  describe('query selector', () => {
    it('should return empty string initially', () => {
      const query = engine.read(getQuery(iface));
      expect(query).toBe('');
    });

    it('should return updated query after mutation', () => {
      engine.mutate(setQuery('laptops', iface));
      const query = engine.read(getQuery(iface));
      expect(query).toBe('laptops');
    });
  });
});
