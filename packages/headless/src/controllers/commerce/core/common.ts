import {
  AsyncThunkAction,
  PayloadActionCreator,
  PrepareAction,
} from '@reduxjs/toolkit';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';
import {SliceIdPart} from '../../../features/commerce/common/actions';

export type FetchResultsActionCreator = (part: SliceIdPart) => AsyncThunkAction<
  unknown,
  SliceIdPart,
  AsyncThunkOptions<unknown>
>;

export type ToggleActionCreator = PayloadActionCreator<
  unknown,
  string,
  PrepareAction<unknown>
>;
