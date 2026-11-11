import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildMockCommerceState} from '../../test/mock-commerce-state.js';
import {
  buildMockController,
  buildMockControllerWithInitialState,
} from '../../test/mock-controller.js';
import {buildMockCommerceEngine} from '../../test/mock-engine-v2.js';
import {buildMockNavigatorContext} from '../../test/mock-navigator-context.js';
import {
  defineMockCommerceController,
  defineMockCommerceControllerReadingPageFacts,
} from '../../test/mock-ssr-controller-definitions.js';
import {buildControllerDefinitions, createStaticState} from './controller-utils.js';
import type {SSRCommerceEngine} from './factories/build-factory.js';
import type {CommonBuildConfig, ResolvedEnableResults} from './types/build.js';
import {SolutionType} from './types/controller-constants.js';

describe('commerce controller-utils', () => {
  const enableResults: ResolvedEnableResults = {listing: true, search: false};
  let mockEngine: SSRCommerceEngine;
  let buildConfig: CommonBuildConfig;

  beforeEach(() => {
    mockEngine = buildMockCommerceEngine(buildMockCommerceState()) as SSRCommerceEngine;
    buildConfig = {
      navigatorContext: buildMockNavigatorContext(),
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        view: {url: 'https://example.com'},
      },
      searchParams: {page: 2},
      productId: 'product-123',
    };
  });

  describe('#buildControllerDefinitions', () => {
    it('should build every available definition once with the engine, the solution type, the page facts and the results flag', () => {
      const definitionsMap = {
        controller1: defineMockCommerceController(),
        controller2: defineMockCommerceController(),
      };

      const controllers = buildControllerDefinitions({
        definitionsMap,
        engine: mockEngine,
        solutionType: SolutionType.search,
        buildConfig,
        enableResults,
      });

      expect(Object.keys(controllers)).toEqual(['controller1', 'controller2']);
      expect(definitionsMap.controller1.build).toHaveBeenCalledExactlyOnceWith(mockEngine, {
        solutionType: SolutionType.search,
        buildConfig,
        enableResults,
      });
      expect(definitionsMap.controller2.build).toHaveBeenCalledExactlyOnceWith(mockEngine, {
        solutionType: SolutionType.search,
        buildConfig,
        enableResults,
      });
    });

    it('should let a definition read the page facts of the request', () => {
      const definitionsMap = {reader: defineMockCommerceControllerReadingPageFacts()};

      const {reader} = buildControllerDefinitions({
        definitionsMap,
        engine: mockEngine,
        solutionType: SolutionType.listing,
        buildConfig,
        enableResults,
      });

      expect(reader.state).toEqual(buildConfig);
    });

    describe('when the definition contains a mix of solution type controllers', () => {
      it('should build only the controllers available for the solution type', () => {
        const definitionsMap = {
          available: defineMockCommerceController({search: true}),
          unavailable: defineMockCommerceController({search: false}),
        };

        const controllers = buildControllerDefinitions({
          definitionsMap,
          engine: mockEngine,
          solutionType: SolutionType.search,
          buildConfig,
          enableResults,
        });

        expect(Object.keys(controllers)).toEqual(['available']);
        expect(definitionsMap.unavailable.build).not.toHaveBeenCalled();
      });

      it('should skip a controller whose definition does not mention the solution type', () => {
        const definitionsMap = {
          searchOnly: {search: true, build: vi.fn(() => buildMockController())},
        };

        const controllers = buildControllerDefinitions({
          definitionsMap,
          engine: mockEngine,
          solutionType: SolutionType.listing,
          buildConfig,
          enableResults,
        });

        expect(controllers).toEqual({});
        expect(definitionsMap.searchOnly.build).not.toHaveBeenCalled();
      });

      it('should build no controller when none is available for the solution type', () => {
        const definitionsMap = {
          controller1: defineMockCommerceController({search: false}),
          controller2: defineMockCommerceController({search: false}),
        };

        const controllers = buildControllerDefinitions({
          definitionsMap,
          engine: mockEngine,
          solutionType: SolutionType.search,
          buildConfig,
          enableResults,
        });

        expect(controllers).toEqual({});
      });
    });
  });

  describe('#createStaticState', () => {
    const searchActions = [
      {type: 'commerce/search/executeSearch/fulfilled', payload: {q: 'test'}},
      {type: 'commerce/recommendations/fetch/fulfilled', payload: {products: []}},
    ];

    it('should keep the state of every controller and nothing else', () => {
      const controllers = {
        controller1: buildMockController(),
        controller2: buildMockControllerWithInitialState(mockEngine, {
          initialState: {prop1: 'value1', prop2: 42},
        }),
      };

      const staticState = createStaticState({searchActions, controllers});

      expect(staticState.controllers).toEqual({
        controller1: {state: {}},
        controller2: {state: {prop1: 'value1', prop2: 42}},
      });
      expect(staticState.controllers.controller2).not.toHaveProperty('initialState');
    });

    it('should clone the controller states and each search action', () => {
      const controller = buildMockControllerWithInitialState(mockEngine, {
        initialState: {nested: {value: 1}},
      });

      const staticState = createStaticState({searchActions, controllers: {controller}});

      expect(staticState.controllers.controller.state).toEqual(controller.state);
      expect(staticState.controllers.controller.state).not.toBe(controller.state);
      expect(staticState.searchActions).toEqual(searchActions);
      expect(staticState.searchActions[0]).not.toBe(searchActions[0]);
      expect(staticState.searchActions[1]).not.toBe(searchActions[1]);
    });
  });
});
