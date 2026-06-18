import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
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

const selectorsCache = new Map<
  string,
  ReturnType<typeof createSearchParametersSelectors>
>();
export function getOrCreateSearchParametersSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(
      interfaceId,
      createSearchParametersSelectors(interfaceId)
    );
  }
  return selectorsCache.get(interfaceId)!;
}
