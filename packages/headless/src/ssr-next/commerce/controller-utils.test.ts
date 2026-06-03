import type {UnknownAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {buildMockCommerceState} from '../../test/mock-commerce-state.js';
import {
  buildMockController,
  buildMockControllerWithInitialState,
} from '../../test/mock-controller.js';
import {buildMockCommerceEngine} from '../../test/mock-engine-v2.js';
import {
  defineMockCommerceController,
  defineMockCommerceControllerWithProps,
} from '../../test/mock-ssr-controller-definitions.js';
import * as utils from '../../utils/utils.js';
import {ControllerBuilder} from '../common/builders/controller-builder.js';
import {createStaticControllerBuilder} from '../common/builders/static-controller-builder.js';
import {
  buildControllerDefinitions,
  createStaticState,
} from './controller-utils.js';
import type {SSRCommerceEngine} from './factories/build-factory.js';
import {SolutionType} from './types/controller-constants.js';
import type {ControllerDefinition} from './types/controller-definitions.js';

vi.mock('../../utils/utils.js', {spy: true});
vi.mock('../common/builders/static-controller-builder.js', {spy: true});
vi.mock('../common/builders/controller-builder.js', {spy: true});

describe('commerce controller-utils', () => {
  let mockSearchActions: UnknownAction[];
  let mockEngine: SSRCommerceEngine;

  beforeEach(() => {
    mockEngine = buildMockCommerceEngine(
      buildMockCommerceState()
    ) as SSRCommerceEngine;
    mockSearchActions = [
      {type: 'search/executeSearch/fulfilled', payload: {q: 'test'}},
      {type: 'products/fetch/fulfilled', payload: {products: []}},
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#buildControllerDefinitions', () => {
    const mockControllerBuilderWithAdditionalArgs = vi.fn();
    const mockControllerBuilderBuild = vi.fn();

    const buildControllersWithDefaultSetup = () => {
      const definitionsMap = {
        controller1: defineMockCommerceController(),
        controller2: defineMockCommerceControllerWithProps(),
      };

      buildControllerDefinitions({
        definitionsMap,
        engine: mockEngine,
        solutionType: SolutionType.search,
        propsMap: {
          controller2: {initialState: {prop1: 'value1', prop2: 42}},
        },
      });
    };

    beforeEach(() => {
      vi.mocked(ControllerBuilder).mockImplementation(function () {
        this.withAdditionalArgs =
          mockControllerBuilderWithAdditionalArgs.mockReturnThis();
        this.build = mockControllerBuilderBuild.mockReturnValue(
          buildMockController()
        );
      });
    });

    it('should call #ControllerBuilder as many times as there are definitions', () => {
      buildControllersWithDefaultSetup();
      expect(ControllerBuilder).toHaveBeenCalledTimes(2);
      expect(mockControllerBuilderBuild).toHaveBeenCalledTimes(2);
    });

    it('should call #withAdditionalArgs with solutionType for each controller', () => {
      buildControllersWithDefaultSetup();
      expect(mockControllerBuilderWithAdditionalArgs).toHaveBeenCalledTimes(2);
      expect(mockControllerBuilderWithAdditionalArgs).toHaveBeenCalledWith([
        SolutionType.search,
      ]);
    });

    it('should call #ControllerBuilder for the controller without props with the correct arguments', () => {
      buildControllersWithDefaultSetup();
      expect(ControllerBuilder).toHaveBeenNthCalledWith(
        1,
        {
          build: expect.any(Function),
          listing: true,
          search: true,
          standalone: true,
          recommendation: true,
        },
        mockEngine,
        undefined
      );
    });

    it('should call #ControllerBuilder for the controller with props with the correct arguments', () => {
      buildControllersWithDefaultSetup();
      expect(ControllerBuilder).toHaveBeenNthCalledWith(
        2,
        {
          buildWithProps: expect.any(Function),
          listing: true,
          search: true,
          standalone: true,
          recommendation: true,
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

    describe('when the definition contains a mix of solution type controllers', () => {
      let controller1: ControllerDefinition<Controller>;
      let controller2: ControllerDefinition<Controller>;

      beforeEach(() => {
        controller1 = defineMockCommerceController({
          search: true,
          recommendation: false,
        });
        controller2 = defineMockCommerceController({
          search: false,
          recommendation: false,
        });
      });

      it('should call #ControllerBuilder for the controllers with the appropriate solution type', () => {
        buildControllerDefinitions({
          definitionsMap: {controller1, controller2},
          engine: mockEngine,
          solutionType: SolutionType.search,
        });

        // should only call for controller1 with listing and search
        expect(ControllerBuilder).toHaveBeenCalledTimes(1);
      });

      it('should call #ControllerBuilder with the appropriate arguments', () => {
        buildControllerDefinitions({
          definitionsMap: {controller1, controller2},
          engine: mockEngine,
          solutionType: SolutionType.search,
        });

        expect(ControllerBuilder).toHaveBeenCalledWith(
          expect.objectContaining({
            build: expect.any(Function),
            search: true,
          }),
          mockEngine,
          undefined
        );
      });

      it('should not call #ControllerBuilder if no controller is defined for the solution type', () => {
        controller1 = defineMockCommerceController({
          search: false,
        });
        controller2 = defineMockCommerceController({
          search: false,
        });

        buildControllerDefinitions({
          definitionsMap: {controller1, controller2},
          engine: mockEngine,
          solutionType: SolutionType.search,
        });

        expect(ControllerBuilder).not.toHaveBeenCalled();
      });
    });
  });

  describe('#createStaticState', () => {
    beforeEach(() => {
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
        searchActions: mockSearchActions,
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

    it('should call #clone for each search action with the proper arguments', () => {
      expect(utils.clone).toHaveBeenCalledTimes(2);
      expect(utils.clone).toHaveBeenNthCalledWith(1, mockSearchActions[0]);
      expect(utils.clone).toHaveBeenNthCalledWith(2, mockSearchActions[1]);
    });
  });
});
