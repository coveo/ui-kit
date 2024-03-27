import {
  ActionCreatorWithPreparedPayload,
  AsyncThunkAction,
} from '@reduxjs/toolkit';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';

export type FetchResultsActionCreator = () => AsyncThunkAction<
  unknown,
  void,
  AsyncThunkOptions<unknown>
>;

interface AnyToggleFacetValueActionCreatorPayload {
  selection: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  facetId: string;
}

export type ToggleActionCreator = ActionCreatorWithPreparedPayload<
  [payload: AnyToggleFacetValueActionCreatorPayload],
  unknown,
  string
>;
