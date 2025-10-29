import type {UnknownAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {CoreEngine} from '../../app/engine.js';
import {
  buildMockController,
  buildMockControllerWithInitialState,
} from '../../test/mock-controller.js';
import {buildMockSearchEngine} from '../../test/mock-engine-v2.js';
import {
  defineMockController,
  defineMockControllerWithProps,
} from '../../test/mock-ssr-controller-definitions.js';
import {createMockState} from '../../test/mock-state.js';
import * as utils from '../../utils/utils.js';
import {ControllerBuilder} from '../common/builders/controller-builder.js';
import {createStaticControllerBuilder} from '../common/builders/static-controller-builder.js';
import {
  buildControllerDefinitions,
  createStaticState,
} from './controller-utils.js';

vi.mock('../../utils/utils.js', {spy: true});
vi.mock('../common/builders/static-controller-builder.js', {spy: true});
vi.mock('../common/builders/controller-builder.js', {spy: true});

describe('controller-utils', () => {
  let mockSearchAction: UnknownAction;
  let mockEngine: CoreEngine;

  beforeEach(() => {
    mockEngine = buildMockSearchEngine(createMockState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#buildControllerDefinitions', () => {
    const mockControllerBuilder = vi.mocked(ControllerBuilder);
    const mockControllerBuilderBuildMethod = vi.fn();
    beforeEach(() => {
      mockControllerBuilderBuildMethod.mockReturnValue(buildMockController());
      mockControllerBuilder.mockImplementation(function () {
        this.build = mockControllerBuilderBuildMethod;
      });

      const definitionsMap = {
        controller1: defineMockController(),
        controller2: defineMockControllerWithProps(),
      };

      buildControllerDefinitions({
        definitionsMap,
        engine: mockEngine,
        propsMap: {
          controller2: {initialState: {prop1: 'value1', prop2: 42}},
        },
      });
    });

    it('should call #ControllerBuilder as many times as there are definitions', () => {
      expect(ControllerBuilder).toHaveBeenCalledTimes(2);
      expect(mockControllerBuilderBuildMethod).toHaveBeenCalledTimes(2);
    });

    it('should call #ControllerBuilder for the controller without props with the correct arguments', () => {
      const noProps = undefined;
      expect(ControllerBuilder).toHaveBeenNthCalledWith(
        1,
        {
          build: expect.any(Function),
        },
        mockEngine,
        noProps
      );
    });

    it('should call #ControllerBuilder for the controller with props with the correct arguments', () => {
      expect(ControllerBuilder).toHaveBeenNthCalledWith(
        2,
        {
          buildWithProps: expect.any(Function),
        },
        mockEngine,
        {
          initialState: {
            prop1: 'value1',
            prop2: 42,
          },
        }
      );
    });
  });

  describe('#createStaticState', () => {
    beforeEach(() => {
      mockSearchAction = {type: 'search', payload: {q: 'test'}};
      const mockStaticBuilder = {
        withState: vi.fn().mockReturnThis(),
        withInitialState: vi.fn().mockReturnThis(),
        build: vi.fn().mockReturnValue({
          state: {},
        }),
      };

      vi.mocked(createStaticControllerBuilder).mockReturnValue(
        mockStaticBuilder
      );

      const controllers = {
        controller1: buildMockController(),
        controller2: buildMockControllerWithInitialState(mockEngine, {
          initialState: {prop1: 'value1', prop2: 42},
        }),
      };
      createStaticState({
        searchActions: [mockSearchAction],
        controllers,
      });
    });

    it('should call #createStaticControllerBuilder as many times as there are controllers', () => {
      expect(createStaticControllerBuilder).toHaveBeenCalledTimes(2);
    });

    it('should call #createStaticControllerBuilder with the correct arguments', () => {
      expect(createStaticControllerBuilder).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          state: {},
        })
      );

      expect(createStaticControllerBuilder).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          state: {prop1: 'value1', prop2: 42},
        })
      );
    });

    it('should call #clone once with the proper arguments', () => {
      expect(utils.clone).toHaveBeenCalledTimes(1);
      expect(utils.clone).toHaveBeenCalledWith([mockSearchAction]);
    });
  });
});
