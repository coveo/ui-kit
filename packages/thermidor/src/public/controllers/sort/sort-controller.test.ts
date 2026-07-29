import {describe, it, expect, beforeEach, vi} from 'vitest';
import {Engine, FullEngine, getFullEngine} from '@/src/internal/engine/index.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {getOrCreateSortActions} from '@/src/internal/features/sort/index.js';
import {buildSortController} from './sort-controller.js';

describe('sort controller', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let searchInterface: ReturnType<typeof buildSearchInterface>;
  let sortActions: ReturnType<typeof getOrCreateSortActions>;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    searchInterface = buildSearchInterface({engine});
    sortActions = getOrCreateSortActions(searchInterface);
  });

  describe('buildSortController', () => {
    it('returns a controller with correct initial state', () => {
      const controller = buildSortController({interface: searchInterface});

      expect(controller.state.appliedSort).toBeNull();
      expect(controller.state.availableSorts).toEqual([]);
    });
  });

  describe('sortBy', () => {
    it('updates appliedSort in state', () => {
      const controller = buildSortController({interface: searchInterface});

      controller.sortBy({by: 'date', direction: 'ascending'});

      expect(controller.state.appliedSort).toEqual({
        by: 'date',
        direction: 'ascending',
      });
    });

    it('invokes search facade thunks', () => {
      const controller = buildSortController({interface: searchInterface});

      const result = controller.sortBy({by: 'relevance'});

      expect(result).toBeUndefined();
    });

    it('accepts a compound array', () => {
      const controller = buildSortController({interface: searchInterface});
      const compound = [
        {by: 'field' as const, field: 'price', direction: 'ascending' as const},
        {by: 'date' as const, direction: 'descending' as const},
      ];

      controller.sortBy(compound);

      expect(controller.state.appliedSort).toEqual(compound);
    });
  });

  describe('isSortedBy', () => {
    it('returns true when criteria match', () => {
      const controller = buildSortController({interface: searchInterface});

      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {by: 'date', direction: 'ascending'},
          availableSorts: [{by: 'date', direction: 'ascending'}, {by: 'relevance'}],
        })
      );

      expect(controller.isSortedBy({by: 'date', direction: 'ascending'})).toBe(true);
    });

    it('returns false when criteria differ', () => {
      const controller = buildSortController({interface: searchInterface});

      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {by: 'date', direction: 'ascending'},
          availableSorts: [{by: 'date', direction: 'ascending'}, {by: 'relevance'}],
        })
      );

      expect(controller.isSortedBy({by: 'relevance'})).toBe(false);
    });

    it('returns false when appliedSort is null', () => {
      const controller = buildSortController({interface: searchInterface});

      expect(controller.isSortedBy({by: 'date', direction: 'ascending'})).toBe(false);
    });
  });

  describe('isSortedBy structural equality', () => {
    it('returns true for structurally equivalent objects', () => {
      const controller = buildSortController({interface: searchInterface});

      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {by: 'field', field: 'price', direction: 'ascending'},
          availableSorts: [{by: 'field', field: 'price', direction: 'ascending'}],
        })
      );

      expect(
        controller.isSortedBy({
          by: 'field',
          field: 'price',
          direction: 'ascending',
        })
      ).toBe(true);
    });

    it('excludes displayName from comparison', () => {
      const controller = buildSortController({interface: searchInterface});

      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {
            by: 'field',
            field: 'price',
            direction: 'ascending',
            displayName: 'Price Low-High',
          },
          availableSorts: [],
        })
      );

      expect(
        controller.isSortedBy({
          by: 'field',
          field: 'price',
          direction: 'ascending',
        })
      ).toBe(true);
      expect(
        controller.isSortedBy({
          by: 'field',
          field: 'price',
          direction: 'ascending',
          displayName: 'Different Name',
        })
      ).toBe(true);
    });

    it('returns false for different criteria', () => {
      const controller = buildSortController({interface: searchInterface});

      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {by: 'field', field: 'price', direction: 'ascending'},
          availableSorts: [],
        })
      );

      expect(
        controller.isSortedBy({
          by: 'field',
          field: 'price',
          direction: 'descending',
        })
      ).toBe(false);
      expect(controller.isSortedBy({by: 'relevance'})).toBe(false);
    });
  });

  describe('compound sort (array)', () => {
    it('sortBy accepts an array', () => {
      const controller = buildSortController({interface: searchInterface});
      const compound = [
        {by: 'field' as const, field: 'price', direction: 'ascending' as const},
        {by: 'date' as const, direction: 'descending' as const},
      ];

      controller.sortBy(compound);

      expect(controller.state.appliedSort).toEqual(compound);
    });

    it('isSortedBy matches array criteria element-by-element', () => {
      const controller = buildSortController({interface: searchInterface});
      const compound = [
        {by: 'field' as const, field: 'price', direction: 'ascending' as const},
        {by: 'date' as const, direction: 'descending' as const},
      ];

      controller.sortBy(compound);

      expect(controller.isSortedBy(compound)).toBe(true);
      expect(
        controller.isSortedBy([
          {by: 'field', field: 'price', direction: 'ascending'},
          {by: 'date', direction: 'ascending'},
        ])
      ).toBe(false);
    });
  });

  describe('subscribe', () => {
    it('notifies on state changes', () => {
      const controller = buildSortController({interface: searchInterface});
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {by: 'relevance'},
          availableSorts: [{by: 'relevance'}, {by: 'date', direction: 'ascending'}],
        })
      );

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
