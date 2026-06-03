import {describe, expect, it, vi} from 'vitest';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {clone} from '../../../utils/utils.js';
import {
  createStaticControllerBuilder,
  type StaticControllerState,
} from './static-controller-builder.js';

vi.mock('../../../utils/utils.js', {spy: true});

describe('createStaticControllerBuilder', () => {
  const buildMockController = (
    overrides: Partial<StaticControllerState> = {}
  ) =>
    ({
      state: {},
      ...overrides,
    }) as Controller;

  beforeEach(() => {
    vi.clearAllMocks(); // Clear calls from creating the builder
  });

  it('should create builder from controller with initial state', () => {
    const mockController = buildMockController({
      state: {property: 'value'},
      initialState: {initial: 'state'},
    });

    const result = createStaticControllerBuilder(mockController).build();

    expect(result).toEqual({
      state: {property: 'value'},
      initialState: {initial: 'state'},
    });
  });

  it('should allow overriding properties after creation', () => {
    const mockController = buildMockController();

    const builder = createStaticControllerBuilder(mockController);
    const result = builder
      .withState({property: 'overridden'})
      .withInitialState({initial: 'new'})
      .build();

    expect(result).toEqual({
      state: {property: 'overridden'},
      initialState: {initial: 'new'},
    });
  });

  describe('state cloning', () => {
    it('should clone state when creating builder from controller', () => {
      const mockState = {nested: {property: 'value'}};
      const mockController = buildMockController({state: mockState});

      createStaticControllerBuilder(mockController).build();

      expect(vi.mocked(clone)).toHaveBeenCalledOnce();
      expect(vi.mocked(clone)).toHaveBeenCalledWith(mockState);
    });

    it('should clone initial state when creating builder from controller with initial state', () => {
      const mockInitialState = {nested: {property: 'value'}};
      const mockController = buildMockController({
        initialState: mockInitialState,
      });

      createStaticControllerBuilder(mockController).build();

      expect(vi.mocked(clone)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(clone)).toHaveBeenCalledWith(mockInitialState);
    });
  });
});
