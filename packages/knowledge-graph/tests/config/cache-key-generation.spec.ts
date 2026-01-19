import {describe, expect, it} from 'vitest';
import type {
  ActionData,
  ComponentData,
  ReducerData,
} from '../../src/config/index.js';
import {
  generateActionCacheKeys,
  generateComponentCacheKeys,
  generateControllerCacheKeys,
  generateReducerCacheKeys,
} from '../../src/config/index.js';

describe('Cache Key Generation', () => {
  describe('generateControllerCacheKeys()', () => {
    it('should generate keys for controller with full context', () => {
      const keys = generateControllerCacheKeys(
        'SearchBox',
        'buildSearchBox',
        'search'
      );

      // Actual order: name, buildFunction, name:package, buildFunction:package
      expect(keys).toContain('controller:SearchBox');
      expect(keys).toContain('controller:buildSearchBox');
      expect(keys).toContain('controller:SearchBox:search');
      expect(keys).toContain('controller:buildSearchBox:search');
    });

    it('should handle controller with search package (default)', () => {
      const keys = generateControllerCacheKeys(
        'GenericController',
        'buildGenericController',
        'search'
      );

      // Should still include all key variations
      expect(keys).toContain('controller:GenericController');
      expect(keys).toContain('controller:buildGenericController');
      expect(keys).toContain('controller:GenericController:search');
      expect(keys).toContain('controller:buildGenericController:search');
    });

    it('should generate keys for commerce package', () => {
      const keys = generateControllerCacheKeys(
        'ProductList',
        'buildProductList',
        'commerce'
      );

      expect(keys).toContain('controller:ProductList');
      expect(keys).toContain('controller:buildProductList');
      expect(keys).toContain('controller:ProductList:commerce');
      expect(keys).toContain('controller:buildProductList:commerce');
    });
  });

  describe('generateActionCacheKeys()', () => {
    it('should generate keys for action with full context', () => {
      const actionData: ActionData = {
        name: 'fetchResults',
        type: 'search/fetchResults',
        labels: ['Action', 'AsyncAction'],
        properties: {
          name: 'fetchResults',
          type: 'search/fetchResults',
          package: 'search',
          feature: 'search',
          filePath: 'packages/headless/src/features/search/search-actions.ts',
          actionKind: 'async',
        },
      };

      const keys = generateActionCacheKeys(actionData);

      // Keys: name, type, name:feature, name:package, name:package:feature
      expect(keys).toContain('action:fetchResults');
      expect(keys).toContain('action:search/fetchResults');
      expect(keys).toContain('action:fetchResults:search');
      expect(keys).toContain('action:fetchResults:search:search');
    });

    it('should handle action without feature', () => {
      const actionData: ActionData = {
        name: 'setEnabled',
        type: 'analytics/setEnabled',
        labels: ['Action'],
        properties: {
          name: 'setEnabled',
          type: 'analytics/setEnabled',
          package: 'search',
          feature: '',
          filePath:
            'packages/headless/src/features/analytics/analytics-actions.ts',
          actionKind: 'sync',
        },
      };

      const keys = generateActionCacheKeys(actionData);

      expect(keys).toContain('action:setEnabled');
      expect(keys).toContain('action:analytics/setEnabled');
    });
  });

  describe('generateComponentCacheKeys()', () => {
    it('should generate keys for Lit component', () => {
      const componentData: ComponentData = {
        name: 'AtomicSearchBox',
        labels: ['Component', 'LitComponent'],
        properties: {
          name: 'AtomicSearchBox',
          path: 'packages/atomic/src/components/search/atomic-search-box.tsx',
          framework: 'lit',
          type: 'atomic',
        },
      };

      const keys = generateComponentCacheKeys(componentData);

      // Keys: name, name:framework, path
      expect(keys).toContain('component:AtomicSearchBox');
      expect(keys).toContain('component:AtomicSearchBox:lit');
      expect(keys).toContain(
        'component:packages/atomic/src/components/search/atomic-search-box.tsx'
      );
    });

    it('should generate keys for Stencil component', () => {
      const componentData: ComponentData = {
        name: 'AtomicFacet',
        labels: ['Component', 'StencilComponent'],
        properties: {
          name: 'AtomicFacet',
          path: 'packages/atomic/src/components/facets/atomic-facet.tsx',
          framework: 'stencil',
          type: 'atomic',
          tag: 'atomic-facet',
        },
      };

      const keys = generateComponentCacheKeys(componentData);

      expect(keys).toContain('component:AtomicFacet');
      expect(keys).toContain('component:AtomicFacet:stencil');
      expect(keys).toContain(
        'component:packages/atomic/src/components/facets/atomic-facet.tsx'
      );
    });

    it('should generate keys for functional component', () => {
      const componentData: ComponentData = {
        name: 'StencilLoadingIndicator',
        labels: ['Component', 'FunctionalComponent'],
        properties: {
          name: 'StencilLoadingIndicator',
          path: 'packages/atomic/src/components/common/stencil-loading-indicator.tsx',
          framework: 'stencil',
          type: 'functional',
        },
      };

      const keys = generateComponentCacheKeys(componentData);

      expect(keys).toContain('component:StencilLoadingIndicator');
      expect(keys).toContain('component:StencilLoadingIndicator:stencil');
    });

    it('should handle component without tag', () => {
      const componentData: ComponentData = {
        name: 'HelperComponent',
        labels: ['Component'],
        properties: {
          name: 'HelperComponent',
          path: 'packages/atomic/src/components/helper.tsx',
          framework: 'lit',
          type: 'atomic',
        },
      };

      const keys = generateComponentCacheKeys(componentData);

      expect(keys).toContain('component:HelperComponent');
      expect(keys).toContain('component:HelperComponent:lit');
      expect(keys).toContain(
        'component:packages/atomic/src/components/helper.tsx'
      );
    });
  });

  describe('generateReducerCacheKeys()', () => {
    it('should generate keys for reducer with full context', () => {
      const reducerData: ReducerData = {
        name: 'search',
        labels: ['Reducer'],
        properties: {
          name: 'search',
          package: 'search',
          feature: 'search',
          filePath: 'packages/headless/src/features/search/search-slice.ts',
        },
      };

      const keys = generateReducerCacheKeys(reducerData);

      // Keys: name, name:feature, name:package, name:package:feature
      expect(keys).toContain('reducer:search');
      expect(keys).toContain('reducer:search:search');
      expect(keys).toContain('reducer:search:search:search');
    });

    it('should generate keys for reducer without feature', () => {
      const reducerData: ReducerData = {
        name: 'configuration',
        labels: ['Reducer'],
        properties: {
          name: 'configuration',
          package: 'search',
          feature: '',
          filePath:
            'packages/headless/src/features/configuration/configuration-slice.ts',
        },
      };

      const keys = generateReducerCacheKeys(reducerData);

      expect(keys).toContain('reducer:configuration');
      expect(keys).toContain('reducer:configuration:search');
    });

    it('should handle reducerSlice name variation', () => {
      const reducerData: ReducerData = {
        name: 'facetSet',
        labels: ['Reducer'],
        properties: {
          name: 'facetSet',
          package: 'search',
          feature: 'facets',
          filePath:
            'packages/headless/src/features/facets/facet-set/facet-set-slice.ts',
        },
      };

      const keys = generateReducerCacheKeys(reducerData);

      expect(keys).toContain('reducer:facetSet');
      expect(keys).toContain('reducer:facetSet:facets');
      expect(keys).toContain('reducer:facetSet:search');
      expect(keys).toContain('reducer:facetSet:search:facets');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings in action data', () => {
      const actionData: ActionData = {
        name: '',
        type: '',
        labels: ['Action'],
        properties: {
          name: '',
          type: '',
          package: 'search',
          feature: '',
          filePath: '',
          actionKind: 'sync',
        },
      };

      const keys = generateActionCacheKeys(actionData);

      expect(keys).toBeDefined();
      expect(Array.isArray(keys)).toBe(true);
    });

    it('should handle special characters in controller names', () => {
      const keys = generateControllerCacheKeys(
        'Search-Box_Controller',
        'buildSearchBox',
        'search'
      );

      expect(keys).toBeDefined();
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should generate consistent keys for same input', () => {
      const componentData: ComponentData = {
        name: 'AtomicSearchBox',
        labels: ['Component', 'LitComponent'],
        properties: {
          name: 'AtomicSearchBox',
          path: 'packages/atomic/src/components/search/atomic-search-box.tsx',
          framework: 'lit',
          type: 'atomic',
        },
      };

      const keys1 = generateComponentCacheKeys(componentData);
      const keys2 = generateComponentCacheKeys(componentData);

      expect(keys1).toEqual(keys2);
    });
  });
});
