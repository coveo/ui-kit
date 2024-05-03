import {
  AsyncThunkAction,
  PayloadActionCreator,
  PrepareAction,
} from '@reduxjs/toolkit';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';

export type FetchResultsActionCreator = () => AsyncThunkAction<
  unknown,
  unknown,
  AsyncThunkOptions<unknown>
>;

export type ToggleActionCreator = PayloadActionCreator<
  unknown,
  string,
  PrepareAction<unknown>
>;
