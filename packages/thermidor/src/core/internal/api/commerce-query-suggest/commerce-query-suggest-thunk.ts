import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';

export function createCommerceSuggestionsThunk(
  _engine: FullEngine,
  scope: EndpointStateScope
) {
  const {stateId} = getHandleInternals(scope.scopeInterface);

  return createAsyncThunk<void, {engine: FullEngine}>(
    `${stateId}/commerceSuggestions/execute`,
    async () => {
      /* TODO: implement commerce suggestions endpoint */
    }
  );
}
