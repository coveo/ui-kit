import {describe, it, expect} from 'vitest';
import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {
  hydrateFromCreateSurface,
  applyDataModelUpdate,
  extractA2uiOperations,
} from './unified-surface-hydration.js';
import {getOrCreateProductListSelectors} from '@/src/internal/features/product-list/index.js';
import {getOrCreateProductListSlice} from '@/src/internal/features/product-list/index.js';
import {getOrCreatePaginationSelectors} from '@/src/internal/features/pagination/index.js';
import {getOrCreatePaginationSlice} from '@/src/internal/features/pagination/index.js';
import {getOrCreateFacetsSlice} from '@/src/internal/features/facets/index.js';
import {getOrCreateSortSelectors} from '@/src/internal/features/sort/index.js';
import {getOrCreateSortSlice} from '@/src/internal/features/sort/index.js';
import {getOrCreateTriggersSlice} from '@/src/internal/features/triggers/index.js';
import {getOrCreateQueryCorrectionSlice} from '@/src/internal/features/query-correction/index.js';
import {
  createSelectSlice,
  getHandleInternals,
  type InterfaceHandle,
} from '@/src/internal/utils/index.js';
import type {TriggersState} from '@/src/internal/features/triggers/triggers-slice.js';

function createTestEngine(): FullEngine {
  const engine = new Engine();
  return getFullEngine(engine);
}

function adoptAllSlices(fullEngine: FullEngine, iface: InterfaceHandle) {
  fullEngine.adoptSlice(getOrCreateProductListSlice(iface));
  fullEngine.adoptSlice(getOrCreatePaginationSlice(iface));
  fullEngine.adoptSlice(getOrCreateFacetsSlice(iface));
  fullEngine.adoptSlice(getOrCreateSortSlice(iface));
  fullEngine.adoptSlice(getOrCreateTriggersSlice(iface));
  fullEngine.adoptSlice(getOrCreateQueryCorrectionSlice(iface));
}

const validDataModel = {
  responseId: 'r1',
  products: [],
  results: [],
  facets: [],
  pagination: {page: 0, perPage: 10, totalEntries: 0, totalPages: 0},
  sort: {appliedSort: {sortCriteria: 'relevance'}, availableSorts: []},
  triggers: [],
};

describe('unified-surface-hydration', () => {
  describe('hydrateFromCreateSurface', () => {
    it('returns null when dataModel is undefined', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        dataModel: undefined,
      });

      expect(result).toBeNull();
    });

    it('returns null when dataModel key is absent', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
      });

      expect(result).toBeNull();
    });

    it('returns non-null result with correct state for empty arrays', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        dataModel: validDataModel,
      });

      expect(result).not.toBeNull();
      expect(result!.surfaceId).toBe('test');
      expect(result!.useCase).toBe('commerceSearch');
      expect(result!.query).toBeUndefined();
      expect(result!.snapshot).toEqual(validDataModel);

      const iface = result!.interface;
      adoptAllSlices(fullEngine, iface);

      applyDataModelUpdate(fullEngine, iface, '/', validDataModel);

      const productSelectors = getOrCreateProductListSelectors(iface);
      const paginationSelectors = getOrCreatePaginationSelectors(iface);
      const sortSelectors = getOrCreateSortSelectors(iface);

      expect(fullEngine.read(productSelectors.getProducts)).toEqual([]);
      expect(fullEngine.read(paginationSelectors.getTotalCount)).toBe(0);
      expect(fullEngine.read(paginationSelectors.getFirstResult)).toBe(0);
      expect(fullEngine.read(paginationSelectors.getPageSize)).toBe(10);
      expect(fullEngine.read(sortSelectors.getAppliedSort)).toEqual({sortCriteria: 'relevance'});
      expect(fullEngine.read(sortSelectors.getAvailableSorts)).toEqual([]);
    });
  });

  describe('applyDataModelUpdate', () => {
    it('silently ignores unknown path (e.g., /responseId)', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        dataModel: validDataModel,
      });

      const iface = result!.interface;
      adoptAllSlices(fullEngine, iface);

      const productSelectors = getOrCreateProductListSelectors(iface);
      const productsBefore = fullEngine.read(productSelectors.getProducts);

      applyDataModelUpdate(fullEngine, iface, '/responseId', 'new-response-id');

      const productsAfter = fullEngine.read(productSelectors.getProducts);
      expect(productsAfter).toEqual(productsBefore);
    });

    it('does not throw for unknown surfaceId (caller handles lookup)', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        dataModel: validDataModel,
      });

      const iface = result!.interface;

      expect(() => {
        applyDataModelUpdate(fullEngine, iface, '/responseId', 'anything');
      }).not.toThrow();
    });

    it('runs full response handler when path is /', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        dataModel: validDataModel,
      });

      const iface = result!.interface;
      adoptAllSlices(fullEngine, iface);

      const updatedDataModel = {
        responseId: 'r2',
        products: [{permanentid: 'p1', ec_name: 'Product 1', additionalFields: {}}],
        results: [],
        facets: [],
        pagination: {page: 1, perPage: 5, totalEntries: 50, totalPages: 10},
        sort: {
          appliedSort: {sortCriteria: 'price asc'},
          availableSorts: [{sortCriteria: 'relevance'}],
        },
        triggers: [{type: 'notify', content: 'hello'}],
      };

      applyDataModelUpdate(fullEngine, iface, '/', updatedDataModel);

      const productSelectors = getOrCreateProductListSelectors(iface);
      const paginationSelectors = getOrCreatePaginationSelectors(iface);
      const sortSelectors = getOrCreateSortSelectors(iface);
      const {stateId} = getHandleInternals(iface);

      expect(fullEngine.read(productSelectors.getProducts)).toHaveLength(1);
      expect(fullEngine.read(productSelectors.getProducts)[0].permanentid).toBe('p1');
      expect(fullEngine.read(paginationSelectors.getTotalCount)).toBe(50);
      expect(fullEngine.read(paginationSelectors.getFirstResult)).toBe(5);
      expect(fullEngine.read(paginationSelectors.getPageSize)).toBe(5);
      expect(fullEngine.read(sortSelectors.getAppliedSort)).toEqual({sortCriteria: 'price asc'});
      expect(fullEngine.read(sortSelectors.getAvailableSorts)).toEqual([
        {sortCriteria: 'relevance'},
      ]);

      const triggersSelector = createSelectSlice<TriggersState>(stateId, 'triggers', {
        triggers: [],
      });
      expect(fullEngine.read(triggersSelector).triggers).toEqual([
        {type: 'notify', content: 'hello'},
      ]);
    });
  });

  describe('extractA2uiOperations', () => {
    it('returns empty array for empty object', () => {
      expect(extractA2uiOperations({})).toEqual([]);
    });

    it('returns empty array when operations is not an array', () => {
      expect(extractA2uiOperations({operations: 'not-an-array'})).toEqual([]);
    });

    it('returns the operations array when valid', () => {
      const ops = [
        {createSurface: {surfaceId: 's1'}},
        {updateDataModel: {surfaceId: 's1', path: '/', value: {}}},
      ];
      expect(extractA2uiOperations({operations: ops})).toEqual(ops);
    });
  });

  describe('noop facade resolver', () => {
    it('search facade resolver produces a thunk that does nothing', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        dataModel: validDataModel,
      });

      expect(result).not.toBeNull();
      const iface = result!.interface;

      const {resolveFacades} = getHandleInternals(iface);
      const thunks = resolveFacades('search');

      expect(thunks).toHaveLength(1);

      adoptAllSlices(fullEngine, iface);

      const productSelectors = getOrCreateProductListSelectors(iface);
      const productsBefore = fullEngine.read(productSelectors.getProducts);

      expect(() => {
        fullEngine.mutate(thunks[0]({engine: fullEngine}));
      }).not.toThrow();

      const productsAfter = fullEngine.read(productSelectors.getProducts);
      expect(productsAfter).toEqual(productsBefore);
    });
  });
});
