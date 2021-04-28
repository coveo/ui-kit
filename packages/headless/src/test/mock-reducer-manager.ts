import {ReducerManager} from '../app/reducer-manager';

export function buildMockReducerManager(
  config: Partial<ReducerManager> = {}
): ReducerManager {
  return {
    add: jest.fn(),
    combinedReducer: jest.fn(),
    ...config,
  };
}
