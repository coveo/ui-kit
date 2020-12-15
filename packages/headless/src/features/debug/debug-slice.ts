import {createReducer} from '@reduxjs/toolkit';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {enableDebug, disableDebug} from './debug-actions';
import {getDebugInitialState} from './debug-state';

export const debugReducer = createReducer(getDebugInitialState(), (builder) => {
  builder
    .addCase(enableDebug, () => true)
    .addCase(disableDebug, () => false)
    .addCase(restoreSearchParameters, (state, action) => {
      return action.payload.debug ?? state;
    });
});
