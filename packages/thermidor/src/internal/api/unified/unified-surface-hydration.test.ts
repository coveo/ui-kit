import {describe, it, expect} from 'vitest';
import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {hydrateFromCreateSurface, extractA2uiOperations} from './unified-surface-hydration.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';

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

function createTestEngine(): FullEngine {
  return getFullEngine(new Engine());
}

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

      const result = hydrateFromCreateSurface(fullEngine, {surfaceId: 'test'});

      expect(result).toBeNull();
    });

    it('returns null for display-only A2UI surfaces', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        components: [{id: 'root', component: 'ProductCarousel'}],
        dataModel: validDataModel,
      });

      expect(result).toBeNull();
    });

    it('returns a commerceSearch routed interface carrying the data model snapshot', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        components: statefulRoot,
        dataModel: validDataModel,
      });

      expect(result).not.toBeNull();
      expect(result!.surfaceId).toBe('test');
      expect(result!.useCase).toBe('commerceSearch');
      expect(result!.query).toBeUndefined();
      expect(result!.snapshot).toEqual(validDataModel);
      expect(result!.interface).toBeDefined();
    });
  });

  describe('routed interface facade', () => {
    it('exposes a noop search facade thunk that does not throw', () => {
      const fullEngine = createTestEngine();

      const result = hydrateFromCreateSurface(fullEngine, {
        surfaceId: 'test',
        components: statefulRoot,
        dataModel: validDataModel,
      });

      expect(result).not.toBeNull();

      const {resolveFacade} = getInterfaceInternals(result!.interface);
      const thunk = resolveFacade('search');

      expect(thunk).toBeDefined();
      expect(() => {
        fullEngine.mutate(thunk({engine: fullEngine}));
      }).not.toThrow();
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

    it('preserves direct catalog properties on component nodes', () => {
      expect(
        extractA2uiOperations({
          messages: [
            {
              version: 'v1.0',
              updateComponents: {
                surfaceId: 's1',
                components: [
                  {
                    id: 'root',
                    component: 'ProductSearchSurface',
                    accessibility: {label: 'Product search results'},
                  },
                ],
              },
            },
          ],
        })
      ).toEqual([
        {
          updateComponents: {
            surfaceId: 's1',
            components: [
              {
                id: 'root',
                component: 'ProductSearchSurface',
                accessibility: {label: 'Product search results'},
              },
            ],
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
            {
              version: 'v1.0',
              updateComponents: {
                surfaceId: 's1',
                components: [
                  {
                    id: 'root',
                    component: 'ProductSearchSurface',
                    componentProps: {label: 'Non-canonical'},
                  },
                ],
              },
            },
          ],
        })
      ).toEqual([]);
    });

    it('preserves the top-level action identifier on action responses', () => {
      expect(
        extractA2uiOperations({
          messages: [{version: 'v1.0', actionId: 'action-1', actionResponse: {value: null}}],
        })
      ).toEqual([{actionResponse: {actionId: 'action-1', response: {value: null}}}]);
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
});
