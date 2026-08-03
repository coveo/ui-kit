import {createAsyncThunk} from '@reduxjs/toolkit';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';

export function createQuerySuggestThunk(iface: InterfaceHandle) {
  const {stateId} = getInterfaceInternals(iface);

  return createAsyncThunk<void, {engine: FullEngine}>(
    `${stateId}/querySuggest/execute`,
    async () => {
      /* TODO: implement query suggest endpoint */
    }
  );
}
