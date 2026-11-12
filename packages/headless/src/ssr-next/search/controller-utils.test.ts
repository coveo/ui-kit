import {beforeEach, describe, expect, it} from 'vitest';
import type {CoreEngine} from '../../app/engine.js';
import {
  buildMockController,
  buildMockControllerWithInitialState,
} from '../../test/mock-controller.js';
import {buildMockSearchEngine} from '../../test/mock-engine-v2.js';
import {buildMockNavigatorContext} from '../../test/mock-navigator-context.js';
import {
  defineMockSearchController,
  defineMockSearchControllerReadingPageFacts,
} from '../../test/mock-ssr-controller-definitions.js';
import {createMockState} from '../../test/mock-state.js';
import {buildControllerDefinitions, createStaticState} from './controller-utils.js';
import type {BuildConfig} from './types/build.js';

describe('controller-utils', () => {
  let mockEngine: CoreEngine;
  let buildConfig: BuildConfig;

  beforeEach(() => {
    mockEngine = buildMockSearchEngine(createMockState());
    buildConfig = {
      navigatorContext: buildMockNavigatorContext(),
      searchParams: {q: 'test'},
      context: {ageGroup: '30-45'},
    };
  });

  describe('#buildControllerDefinitions', () => {
    it('should build every definition once with the engine and the page facts', () => {
      const definitionsMap = {
        controller1: defineMockSearchController(),
        controller2: defineMockSearchController(),
      };

      const controllers = buildControllerDefinitions({
        definitionsMap,
        engine: mockEngine,
        buildConfig,
      });

      expect(Object.keys(controllers)).toEqual(['controller1', 'controller2']);
      expect(definitionsMap.controller1.build).toHaveBeenCalledExactlyOnceWith(mockEngine, {
        buildConfig,
      });
      expect(definitionsMap.controller2.build).toHaveBeenCalledExactlyOnceWith(mockEngine, {
        buildConfig,
      });
    });

    it('should let a definition read the page facts of the request', () => {
      const definitionsMap = {reader: defineMockSearchControllerReadingPageFacts()};

      const {reader} = buildControllerDefinitions({
        definitionsMap,
        engine: mockEngine,
        buildConfig,
      });

      expect(reader.state).toEqual(buildConfig);
    });
  });

  describe('#createStaticState', () => {
    const searchActions = [{type: 'search/executeSearch/fulfilled', payload: {q: 'test'}}];

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

    it('should clone the controller states and the search actions', () => {
      const controller = buildMockControllerWithInitialState(mockEngine, {
        initialState: {nested: {value: 1}},
      });

      const staticState = createStaticState({searchActions, controllers: {controller}});

      expect(staticState.controllers.controller.state).toEqual(controller.state);
      expect(staticState.controllers.controller.state).not.toBe(controller.state);
      expect(staticState.searchActions).toEqual(searchActions);
      expect(staticState.searchActions).not.toBe(searchActions);
    });
  });
});
