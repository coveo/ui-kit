import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {initialSearchParametersState} from './search-parameters-slice.js';

export function createSearchParametersSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'searchParameters',
    initialSearchParametersState
  );
  return {
    getPipeline: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.pipeline
    ),
    getConstantQuery: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.cq
    ),
  };
}

export const getOrCreateSearchParametersSelectors = SingletonFactory(
  createSearchParametersSelectors
);
