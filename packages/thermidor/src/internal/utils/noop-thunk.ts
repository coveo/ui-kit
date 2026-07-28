import {createAsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '@/src/internal/engine/index.js';

export function createNoopThunk(prefix: string) {
  return createAsyncThunk<void, {engine: FullEngine}>(`${prefix}/noop`, async () => {});
}
