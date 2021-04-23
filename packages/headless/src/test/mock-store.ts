import {EnhancedStore} from '@reduxjs/toolkit';

export function buildMockStore(
  config: Partial<EnhancedStore> = {}
): EnhancedStore {
  return {
    dispatch: jest.fn(),
    getState: jest.fn(),
    replaceReducer: jest.fn(),
    subscribe: jest.fn(),
    [Symbol.observable]: jest.fn(),
    ...config,
  };
}
