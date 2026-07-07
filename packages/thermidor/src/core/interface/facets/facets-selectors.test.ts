import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import * as facetsSelectors from './facets-selectors.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateFacetsSlice} from '@/src/core/internal/facets/facets-slice.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('createFacetsSelectors()', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateFacetsSlice(iface));
  });

  describe('all selector', () => {
    it('should return empty object initially', () => {
      expect(engine.read(facetsSelectors.all)).toEqual({});
    });
  });

  describe('byId selector', () => {
    it('should return undefined for non-existent facet', () => {
      expect(engine.read(facetsSelectors.byId('nonexistent'))).toBeUndefined();
    });
  });

  describe('selectedValues selector', () => {
    it('should return empty array for non-existent facet', () => {
      expect(
        engine.read(facetsSelectors.selectedValues('nonexistent'))
      ).toEqual([]);
    });
  });

  describe('allSelectedValues selector', () => {
    it('should return empty array when no facets', () => {
      expect(engine.read(facetsSelectors.allSelectedValues)).toEqual([]);
    });
  });
});
