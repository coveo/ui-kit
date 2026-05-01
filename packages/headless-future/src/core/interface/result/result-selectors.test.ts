/**
 * Result Selectors Tests (Singular)
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as selectors from './result-selectors.js';
import * as mutations from './result-mutatators.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {resultSlice} from '@/src/core/internal/result/result-slice.js';

describe('result selectors', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
    engine.adoptSlice(resultSlice);
  });

  describe('all selector', () => {
    it('should return empty object initially', () => {
      const all = engine.read(selectors.all);
      expect(all).toEqual({});
    });

    it('should return all result states after initialization', () => {
      engine.mutate(mutations.initializeResults(['r1', 'r2']));

      const all = engine.read(selectors.all);
      expect(Object.keys(all)).toEqual(['r1', 'r2']);
      expect(all['r1']).toEqual({isSelected: false, isExpanded: false});
      expect(all['r2']).toEqual({isSelected: false, isExpanded: false});
    });
  });

  describe('byId selector', () => {
    it('should return undefined for non-existent result', () => {
      const result = engine.read(selectors.byId('unknown'));
      expect(result).toBeUndefined();
    });

    it('should return state for an existing result', () => {
      engine.mutate(mutations.initializeResults(['r1']));

      const result = engine.read(selectors.byId('r1'));
      expect(result).toEqual({isSelected: false, isExpanded: false});
    });

    it('should reflect mutations', () => {
      engine.mutate(mutations.initializeResults(['r1']));
      engine.mutate(mutations.setSelected('r1', true));

      const result = engine.read(selectors.byId('r1'));
      expect(result?.isSelected).toBe(true);
      expect(result?.isExpanded).toBe(false);
    });
  });

  describe('selectedIds selector', () => {
    it('should return empty array initially', () => {
      const ids = engine.read(selectors.selectedIds);
      expect(ids).toEqual([]);
    });

    it('should return IDs of selected results', () => {
      engine.mutate(mutations.initializeResults(['r1', 'r2', 'r3']));
      engine.mutate(mutations.setSelected('r1', true));
      engine.mutate(mutations.setSelected('r3', true));

      const ids = engine.read(selectors.selectedIds);
      expect(ids).toEqual(['r1', 'r3']);
    });

    it('should exclude deselected results', () => {
      engine.mutate(mutations.initializeResults(['r1', 'r2']));
      engine.mutate(mutations.setSelected('r1', true));
      engine.mutate(mutations.setSelected('r2', true));
      engine.mutate(mutations.setSelected('r1', false));

      const ids = engine.read(selectors.selectedIds);
      expect(ids).toEqual(['r2']);
    });
  });

  describe('expandedIds selector', () => {
    it('should return empty array initially', () => {
      const ids = engine.read(selectors.expandedIds);
      expect(ids).toEqual([]);
    });

    it('should return IDs of expanded results', () => {
      engine.mutate(mutations.initializeResults(['r1', 'r2', 'r3']));
      engine.mutate(mutations.setExpanded('r2', true));

      const ids = engine.read(selectors.expandedIds);
      expect(ids).toEqual(['r2']);
    });

    it('should exclude collapsed results', () => {
      engine.mutate(mutations.initializeResults(['r1', 'r2']));
      engine.mutate(mutations.setExpanded('r1', true));
      engine.mutate(mutations.setExpanded('r2', true));
      engine.mutate(mutations.setExpanded('r1', false));

      const ids = engine.read(selectors.expandedIds);
      expect(ids).toEqual(['r2']);
    });
  });
});
