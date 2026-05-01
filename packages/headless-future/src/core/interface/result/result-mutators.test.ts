/**
 * Result Mutations Tests (Singular)
 */

import {describe, it, expect, beforeEach} from 'vitest';
import * as mutations from './result-mutatators.js';
import * as selectors from './result-selectors.js';
import {resultSlice} from '@/src/core/internal/result/result-slice.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';

describe('resultMutations', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(resultSlice);
  });

  describe('initializeResults()', () => {
    it('should return StateMutation object', () => {
      const mutation = mutations.initializeResults(['r1', 'r2']);

      expect(mutation).toEqual({
        type: 'result/initializeResults',
        payload: ['r1', 'r2'],
      });
    });

    it('should populate state when used with mutate()', () => {
      engine.mutate(mutations.initializeResults(['r1', 'r2', 'r3']));

      const all = engine.read(selectors.all);
      expect(Object.keys(all)).toEqual(['r1', 'r2', 'r3']);
      expect(all['r1']).toEqual({isSelected: false, isExpanded: false});
    });

    it('should replace previous state entirely', () => {
      engine.mutate(mutations.initializeResults(['old']));
      engine.mutate(mutations.initializeResults(['new1', 'new2']));

      const all = engine.read(selectors.all);
      expect(Object.keys(all)).toEqual(['new1', 'new2']);
      expect(all['old']).toBeUndefined();
    });

    it('should accept empty array', () => {
      engine.mutate(mutations.initializeResults(['r1']));
      engine.mutate(mutations.initializeResults([]));

      const all = engine.read(selectors.all);
      expect(all).toEqual({});
    });
  });

  describe('setSelected()', () => {
    it('should return StateMutation object', () => {
      const mutation = mutations.setSelected('r1', true);

      expect(mutation).toEqual({
        type: 'result/setSelected',
        payload: {id: 'r1', isSelected: true},
      });
    });

    it('should update isSelected when used with mutate()', () => {
      engine.mutate(mutations.initializeResults(['r1']));
      engine.mutate(mutations.setSelected('r1', true));

      const r1 = engine.read(selectors.byId('r1'));
      expect(r1?.isSelected).toBe(true);
    });

    it('should not affect non-existent result', () => {
      engine.mutate(mutations.initializeResults(['r1']));
      engine.mutate(mutations.setSelected('unknown', true));

      const all = engine.read(selectors.all);
      expect(Object.keys(all)).toEqual(['r1']);
    });
  });

  describe('setExpanded()', () => {
    it('should return StateMutation object', () => {
      const mutation = mutations.setExpanded('r1', true);

      expect(mutation).toEqual({
        type: 'result/setExpanded',
        payload: {id: 'r1', isExpanded: true},
      });
    });

    it('should update isExpanded when used with mutate()', () => {
      engine.mutate(mutations.initializeResults(['r1']));
      engine.mutate(mutations.setExpanded('r1', true));

      const r1 = engine.read(selectors.byId('r1'));
      expect(r1?.isExpanded).toBe(true);
    });

    it('should not affect non-existent result', () => {
      engine.mutate(mutations.initializeResults(['r1']));
      engine.mutate(mutations.setExpanded('unknown', true));

      const all = engine.read(selectors.all);
      expect(Object.keys(all)).toEqual(['r1']);
    });
  });

  describe('clearAll()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = mutations.clearAll();

      expect(mutation).toEqual({
        type: 'result/clearAll',
      });
    });

    it('should clear all result state when used with mutate()', () => {
      engine.mutate(mutations.initializeResults(['r1', 'r2']));
      engine.mutate(mutations.setSelected('r1', true));
      engine.mutate(mutations.clearAll());

      const all = engine.read(selectors.all);
      expect(all).toEqual({});
    });
  });

  describe('Integration: multiple mutations', () => {
    it('should handle selection + expansion flow', () => {
      engine.mutate(mutations.initializeResults(['r1', 'r2', 'r3']));
      engine.mutate(mutations.setSelected('r1', true));
      engine.mutate(mutations.setExpanded('r2', true));
      engine.mutate(mutations.setSelected('r3', true));

      expect(engine.read(selectors.selectedIds)).toEqual(['r1', 'r3']);
      expect(engine.read(selectors.expandedIds)).toEqual(['r2']);
    });

    it('should handle re-initialization after state changes', () => {
      engine.mutate(mutations.initializeResults(['r1']));
      engine.mutate(mutations.setSelected('r1', true));
      engine.mutate(mutations.initializeResults(['r1', 'r2']));

      // Re-initialization resets all state
      const r1 = engine.read(selectors.byId('r1'));
      expect(r1?.isSelected).toBe(false);
    });
  });
});
