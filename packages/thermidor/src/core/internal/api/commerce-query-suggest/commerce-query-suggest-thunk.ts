import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';

export function createCommerceSuggestionsThunk(
  _engine: FullEngine,
  scope: EndpointStateScope
) {
  const sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId;

  return createAsyncThunk<void, {engine: FullEngine}>(
    `${sharableInterfaceId}/commerceSuggestions/execute`,
    async () => {
      /* TODO: implement commerce suggestions endpoint */
    }
  );
}
