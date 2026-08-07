import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointThunkArg} from './interface-types.js';

export function createNoopThunk(prefix: string) {
  return createAsyncThunk<void, EndpointThunkArg>(`${prefix}/noop`, async () => {});
}
