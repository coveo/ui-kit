import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {CoreEngine} from '../../../app/engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {buildMockSearchEngine} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import type {
  BaseControllerDefinitionWithoutProps,
  BaseControllerDefinitionWithProps,
} from '../types/controllers.js';
import {ControllerBuilder} from './controller-builder.js';

describe('ControllerBuilder', () => {
  let mockEngine: CoreEngine;
  let mockController: Controller;

  beforeEach(() => {
    mockEngine = buildMockSearchEngine(createMockState());
    mockController = {
      state: {someProperty: 'test'},
      subscribe: vi.fn(),
    };
  });

  describe('with definition that has build method', () => {
    let mockDefinition: BaseControllerDefinitionWithoutProps<
      CoreEngine,
      Controller
    >;
    let builder: ControllerBuilder<
      typeof mockDefinition,
      CoreEngine,
      undefined,
      Controller
    >;

    beforeEach(() => {
      mockDefinition = {
        build: vi.fn().mockReturnValue(mockController),
      };
      builder = new ControllerBuilder(mockDefinition, mockEngine);
    });

    it('should call #build method when building without props', () => {
      const result = builder.build();

      expect(mockDefinition.build).toHaveBeenCalledWith(mockEngine);
      expect(result).toBe(mockController);
    });

    it('should pass additional args to build method', () => {
      const additionalArgs = ['arg1', 'arg2'];
      builder.withAdditionalArgs(additionalArgs);

      builder.build();

      expect(mockDefinition.build).toHaveBeenCalledWith(
        mockEngine,
        'arg1',
        'arg2'
      );
    });
  });

  describe('with definition that has #buildWithProps method', () => {
    interface MockProps {
      prop1: string;
      prop2: number;
    }

    let mockDefinition: BaseControllerDefinitionWithProps<
      CoreEngine,
      Controller,
      MockProps
    >;
    let builder: ControllerBuilder<
      typeof mockDefinition,
      CoreEngine,
      MockProps,
      Controller
    >;
    let mockProps: MockProps;

    beforeEach(() => {
      mockProps = {prop1: 'test', prop2: 42};
      mockDefinition = {
        buildWithProps: vi.fn().mockReturnValue(mockController),
      };
      builder = new ControllerBuilder(mockDefinition, mockEngine, mockProps);
    });

    it('should call #buildWithProps method when building with props', () => {
      const result = builder.build();

      expect(mockDefinition.buildWithProps).toHaveBeenCalledWith(
        mockEngine,
        mockProps
      );
      expect(result).toEqual({
        ...mockController,
        initialState: {someProperty: 'test'},
      });
    });

    it('should pass additional args to buildWithProps method', () => {
      const additionalArgs = ['arg1', 'arg2'];
      builder.withAdditionalArgs(additionalArgs);

      builder.build();

      expect(mockDefinition.buildWithProps).toHaveBeenCalledWith(
        mockEngine,
        mockProps,
        'arg1',
        'arg2'
      );
    });

    it('should add initialState property to the controller', () => {
      const controllerWithState = {
        state: {customProperty: 'value'},
        subscribe: vi.fn(),
      };
      mockDefinition.buildWithProps = vi
        .fn()
        .mockReturnValue(controllerWithState);

      const result = builder.build();

      expect(result).toEqual({
        ...controllerWithState,
        initialState: {customProperty: 'value'},
      });
    });
  });

  it('should throw if the definition contains a controller without a build method', () => {
    const invalidDefinition = {
      // Missing build method
    };
    const builder = new ControllerBuilder(invalidDefinition, mockEngine);
    expect(() => builder.build()).toThrowError(
      'Controller definition must have a build or buildWithProps method.'
    );
  });

  it('should correctly detect build vs buildWithProps based on definition', () => {
    const buildDefinition = {
      build: vi.fn().mockReturnValue(mockController),
    };
    const buildWithPropsDefinition = {
      buildWithProps: vi.fn().mockReturnValue(mockController),
    };

    const builder1 = new ControllerBuilder(buildDefinition, mockEngine);
    const builder2 = new ControllerBuilder(
      buildWithPropsDefinition,
      mockEngine
    );

    builder1.build();
    builder2.build();

    expect(buildDefinition.build).toHaveBeenCalled();
    expect(buildWithPropsDefinition.buildWithProps).toHaveBeenCalled();
  });
});
