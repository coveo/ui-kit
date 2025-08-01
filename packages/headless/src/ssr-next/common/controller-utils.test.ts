import type {UnknownAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {CoreEngine} from '../../app/engine.js';
import {
  buildMockController,
  buildMockControllerWithInitialState,
  defineMockController,
  defineMockControllerWithProps,
  type MockControllerDefinitionWithoutProps,
  type MockControllerDefinitionWithProps,
} from '../../test/mock-controller-definitions.js';
import {buildMockSearchEngine} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import * as utils from '../../utils/utils.js';
import {
  buildControllerDefinitions,
  createStaticState,
} from './controller-utils.js';
import type {EngineStaticState} from './types/engine.js';
import type {
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './types/inference.js';

vi.mock('../../utils/utils.js', {spy: true});

describe('controller-utils', () => {
  type DefinitionsMap = {
    controller1: MockControllerDefinitionWithoutProps;
    controller2: MockControllerDefinitionWithProps;
  };
  let mockSearchAction: UnknownAction;
  let mockEngine: CoreEngine;
  let definitionsMap: DefinitionsMap;
  let definition: InferControllersMapFromDefinition<DefinitionsMap>;

  beforeEach(() => {
    mockEngine = buildMockSearchEngine(createMockState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#buildControllerDefinitions', () => {
    beforeEach(() => {
      definitionsMap = {
        controller1: defineMockController(),
        controller2: defineMockControllerWithProps(),
      };

      definition = buildControllerDefinitions({
        definitionsMap,
        engine: mockEngine,
        propsMap: {
          controller2: {initialState: {prop1: 'value1', prop2: 42}},
        },
      });
    });

    it.skip('should use #build method for controllers without initial state', () => {
      expect(definitionsMap.controller1.build).toHaveBeenCalledWith(mockEngine);
    });

    it.skip('should use #buildWithProps method for controllers with initial state', () => {
      expect(definitionsMap.controller2.buildWithProps).toHaveBeenCalledWith(
        mockEngine,
        {
          initialState: {prop1: 'value1', prop2: 42},
        }
      );
    });

    it.skip('should return a definition with 2 controllers', () => {
      expect(Object.keys(definition).length).toBe(2);
      expect(definition).toHaveProperty('controller');
      expect(definition).toHaveProperty('controllerWithProps');
    });

    it.skip('should only add an initialState to controllers built with props', () => {
      expect(Object.keys(definition.controller1)).not.contain('initialState');
      expect(Object.keys(definition.controller2)).contain('initialState');
    });

    it.skip('should call #mapObject with the proper definition map', () => {
      expect(utils.mapObject).toHaveBeenCalledWith(
        definitionsMap,
        expect.any(Function)
      );
    });
  });

  describe('#createStaticState', () => {
    let controllers: InferControllersMapFromDefinition<DefinitionsMap>;
    let staticState: EngineStaticState<
      UnknownAction,
      InferControllerStaticStateMapFromDefinitions<DefinitionsMap>
    >;

    beforeEach(() => {
      mockSearchAction = {type: 'search', payload: {q: 'test'}};
      controllers = {
        controller1: buildMockController(mockEngine),
        controller2: buildMockControllerWithInitialState(mockEngine, {
          initialState: {prop1: 'value1', prop2: 42},
        }),
      };
      staticState = createStaticState({
        searchAction: mockSearchAction,
        controllers,
      });
    });

    it('should return static state with controllers and searchAction', () => {
      expect(staticState).toStrictEqual({
        controllers: {
          controller1: {
            state: {},
          },
          controller2: {
            state: {prop1: 'value1', prop2: 42},
          },
        },
        searchAction: mockSearchAction,
      });
    });

    it('should call #clone 3 times with the proper arguments', () => {
      expect(utils.clone).toHaveBeenCalledTimes(3);

      // Cloning the first controller state
      expect(utils.clone).toHaveBeenNthCalledWith(1, {});

      // Cloning the second controller state
      expect(utils.clone).toHaveBeenNthCalledWith(2, {
        prop1: 'value1',
        prop2: 42,
      });

      // Cloning the search action
      expect(utils.clone).toHaveBeenNthCalledWith(3, mockSearchAction);
    });
  });
});
