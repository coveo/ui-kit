import {describe, it, expect, vi} from 'vitest';
import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {createNoopThunk} from '@/src/internal/utils/index.js';
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
  getInterfaceInternals,
  type InterfaceHandle,
} from '@/src/internal/utils/index.js';
import type {TriggersState} from '@/src/internal/features/triggers/triggers-slice.js';

const mockSearchThunk = createNoopThunk('unified-test-search');

vi.mock('./unified-search-facade.js', () => ({
  createUnifiedSearchFacadeResolver: () => () => mockSearchThunk,
}));

const mockGenerativeInterface: InterfaceHandle = {disposed: false, dispose: vi.fn()};
const mockCartInterface: InterfaceHandle = {disposed: false, dispose: vi.fn()};

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

const statefulRoot = [{id: 'root', component: 'ProductSearchSurface'}];

describe('unified-surface-hydration', () => {
  describe('hydrateFromCreateSurface', () => {
    it('returns null when dataModel is undefined', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          dataModel: undefined,
        },
        mockGenerativeInterface,
        mockCartInterface
      );

      expect(result).toBeNull();
    });

    it('returns null when dataModel key is absent', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
        },
        mockGenerativeInterface,
        mockCartInterface
      );

      expect(result).toBeNull();
    });

    it('returns null for display-only A2UI surfaces', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          components: [{id: 'root', component: 'ProductCarousel'}],
          dataModel: validDataModel,
        },
        mockGenerativeInterface,
        mockCartInterface
      );

      expect(result).toBeNull();
    });

    it('returns non-null result with correct state for empty arrays', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          components: statefulRoot,
          dataModel: validDataModel,
        },
        mockGenerativeInterface,
        mockCartInterface
      );

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
      expect(fullEngine.read(sortSelectors.getAppliedSort)).toEqual({by: 'relevance'});
      expect(fullEngine.read(sortSelectors.getAvailableSorts)).toEqual([]);
    });
  });

  describe('applyDataModelUpdate', () => {
    it('silently ignores unknown path (e.g., /responseId)', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          components: statefulRoot,
          dataModel: validDataModel,
        },
        mockGenerativeInterface,
        mockCartInterface
      );

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

      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          components: statefulRoot,
          dataModel: validDataModel,
        },
        mockGenerativeInterface,
        mockCartInterface
      );

      const iface = result!.interface;

      expect(() => {
        applyDataModelUpdate(fullEngine, iface, '/responseId', 'anything');
      }).not.toThrow();
    });

    it('translates incremental sort updates to controller criteria', () => {
      const fullEngine = createTestEngine();
      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          components: statefulRoot,
          dataModel: validDataModel,
        },
        mockGenerativeInterface,
        mockCartInterface
      );
      const iface = result!.interface;
      adoptAllSlices(fullEngine, iface);

      applyDataModelUpdate(fullEngine, iface, '/sort', {
        appliedSort: {
          sortCriteria: 'fields',
          fields: [{field: 'price', direction: 'desc', displayName: 'Price'}],
        },
        availableSorts: [{sortCriteria: 'relevance'}],
      });

      const sortSelectors = getOrCreateSortSelectors(iface);
      expect(fullEngine.read(sortSelectors.getAppliedSort)).toEqual({
        by: 'field',
        field: 'price',
        direction: 'descending',
        displayName: 'Price',
      });
      expect(fullEngine.read(sortSelectors.getAvailableSorts)).toEqual([{by: 'relevance'}]);
    });

    it.each([
      {availableSorts: [{sortCriteria: 'relevance'}]},
      {appliedSort: {sortCriteria: 'relevance'}},
    ])('ignores incomplete incremental sort update %#', (sortUpdate) => {
      const fullEngine = createTestEngine();
      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          components: statefulRoot,
          dataModel: validDataModel,
        },
        mockGenerativeInterface,
        mockCartInterface
      );
      const iface = result!.interface;
      adoptAllSlices(fullEngine, iface);
      const sortSelectors = getOrCreateSortSelectors(iface);

      expect(() => applyDataModelUpdate(fullEngine, iface, '/sort', sortUpdate)).not.toThrow();
      expect(fullEngine.read(sortSelectors.getAppliedSort)).toEqual({by: 'relevance'});
      expect(fullEngine.read(sortSelectors.getAvailableSorts)).toEqual([]);
    });

    it('runs full response handler when path is /', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          components: statefulRoot,
          dataModel: validDataModel,
        },
        mockGenerativeInterface,
        mockCartInterface
      );

      const iface = result!.interface;
      adoptAllSlices(fullEngine, iface);

      const updatedDataModel = {
        responseId: 'r2',
        products: [{permanentid: 'p1', ec_name: 'Product 1', additionalFields: {}}],
        results: [],
        facets: [],
        pagination: {page: 1, perPage: 5, totalEntries: 50, totalPages: 10},
        sort: {
          appliedSort: {sortCriteria: 'fields', fields: [{field: 'price', direction: 'asc'}]},
          availableSorts: [{sortCriteria: 'relevance'}],
        },
        triggers: [{type: 'notify', content: 'hello'}],
      };

      applyDataModelUpdate(fullEngine, iface, '/', updatedDataModel);

      const productSelectors = getOrCreateProductListSelectors(iface);
      const paginationSelectors = getOrCreatePaginationSelectors(iface);
      const sortSelectors = getOrCreateSortSelectors(iface);
      const {stateId} = getInterfaceInternals(iface);

      expect(fullEngine.read(productSelectors.getProducts)).toHaveLength(1);
      expect(fullEngine.read(productSelectors.getProducts)[0].permanentid).toBe('p1');
      expect(fullEngine.read(paginationSelectors.getTotalCount)).toBe(50);
      expect(fullEngine.read(paginationSelectors.getFirstResult)).toBe(5);
      expect(fullEngine.read(paginationSelectors.getPageSize)).toBe(5);
      expect(fullEngine.read(sortSelectors.getAppliedSort)).toEqual({
        by: 'field',
        field: 'price',
        direction: 'ascending',
        displayName: undefined,
      });
      expect(fullEngine.read(sortSelectors.getAvailableSorts)).toEqual([{by: 'relevance'}]);

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

    it('returns empty array when messages is not an array', () => {
      expect(extractA2uiOperations({messages: 'not-an-array'})).toEqual([]);
    });

    it('unwraps valid versioned messages', () => {
      const messages = [
        {version: 'v1.0', createSurface: {surfaceId: 's1'}},
        {version: 'v1.0', updateDataModel: {surfaceId: 's1', path: '/', value: {}}},
      ];
      expect(extractA2uiOperations({messages})).toEqual([
        {createSurface: {surfaceId: 's1'}},
        {updateDataModel: {surfaceId: 's1', path: '/', value: {}}},
      ]);
    });

    it('unwraps a valid updateComponents message', () => {
      expect(
        extractA2uiOperations({
          messages: [
            {
              version: 'v1.0',
              updateComponents: {
                surfaceId: 's1',
                components: [{id: 'root', component: 'ProductSearchSurface'}],
              },
            },
          ],
        })
      ).toEqual([
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'root', component: 'ProductSearchSurface'}],
          },
        },
      ]);
    });

    it('ignores malformed updateComponents messages', () => {
      expect(
        extractA2uiOperations({
          messages: [
            {version: 'v1.0', updateComponents: {surfaceId: 's1'}},
            {version: 'v1.0', updateComponents: {surfaceId: 1, components: []}},
          ],
        })
      ).toEqual([]);
    });

    it('ignores malformed messages while preserving valid siblings', () => {
      expect(
        extractA2uiOperations({
          messages: [
            {version: 'v0.8', createSurface: {surfaceId: 'old'}},
            {
              version: 'v1.0',
              createSurface: {surfaceId: 'invalid'},
              deleteSurface: {surfaceId: 'invalid'},
            },
            {version: 'v1.0', deleteSurface: {surfaceId: 's1'}},
          ],
        })
      ).toEqual([{deleteSurface: {surfaceId: 's1'}}]);
    });
  });

  describe('search facade resolver', () => {
    it('search facade resolver produces a thunk that does nothing', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(
        fullEngine,
        {
          surfaceId: 'test',
          components: statefulRoot,
          dataModel: validDataModel,
        },
        mockGenerativeInterface,
        mockCartInterface
      );

      expect(result).not.toBeNull();
      const iface = result!.interface;

      const {resolveFacade} = getInterfaceInternals(iface);
      const thunk = resolveFacade('search');

      expect(thunk).toBeDefined();

      adoptAllSlices(fullEngine, iface);

      const productSelectors = getOrCreateProductListSelectors(iface);
      const productsBefore = fullEngine.read(productSelectors.getProducts);

      expect(() => {
        fullEngine.mutate(thunk({engine: fullEngine}));
      }).not.toThrow();

      const productsAfter = fullEngine.read(productSelectors.getProducts);
      expect(productsAfter).toEqual(productsBefore);
    });
  });
});
