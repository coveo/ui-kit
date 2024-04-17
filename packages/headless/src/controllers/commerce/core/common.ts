import {
  AsyncThunkAction,
  PayloadActionCreator,
  PrepareAction,
} from '@reduxjs/toolkit';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';
import {SolutionTypeActionCreatorPayload} from '../../../features/commerce/common/actions';

export type FetchResultsActionCreator = () => AsyncThunkAction<
  unknown,
  SolutionTypeActionCreatorPayload,
  AsyncThunkOptions<unknown>
>;

export type ToggleActionCreator = PayloadActionCreator<
  unknown,
  string,
  PrepareAction<unknown>
>;
