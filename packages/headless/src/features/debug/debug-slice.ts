import {createReducer} from '@reduxjs/toolkit';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {disableDebug, enableDebug} from './debug-actions.js';
import {getDebugInitialState} from './debug-state.js';

export const debugReducer = createReducer(getDebugInitialState(), (builder) => {
  builder
    .addCase(enableDebug, () => true)
    .addCase(disableDebug, () => false)
    .addCase(restoreSearchParameters, (state, action) => {
      return action.payload.debug ?? state;
    });
});
