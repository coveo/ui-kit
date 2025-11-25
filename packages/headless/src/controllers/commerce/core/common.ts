import type {
  AsyncThunkAction,
  PayloadActionCreator,
  PrepareAction,
} from '@reduxjs/toolkit';
import type {AsyncThunkOptions} from '../../../app/async-thunk-options.js';

export type FetchProductsActionCreator = (
  options?: unknown
) => AsyncThunkAction<unknown, unknown, AsyncThunkOptions<unknown>>;

export type ToggleActionCreator = PayloadActionCreator<
  unknown,
  string,
  PrepareAction<unknown>
>;
