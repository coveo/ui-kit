import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';

export type FetchResultsActionCreator = () => AsyncThunkAction<
  unknown,
  void,
  AsyncThunkOptions<unknown>
>;
