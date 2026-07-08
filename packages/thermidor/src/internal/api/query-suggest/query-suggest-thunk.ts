import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';

export function createQuerySuggestThunk(
  _engine: FullEngine,
  scope: EndpointStateScope
) {
  const {stateId} = getHandleInternals(scope.scopeInterface);

  return createAsyncThunk<void, {engine: FullEngine}>(
    `${stateId}/querySuggest/execute`,
    async () => {
      /* TODO: implement query suggest endpoint */
    }
  );
}
