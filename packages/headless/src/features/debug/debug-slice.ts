import {createReducer} from '@reduxjs/toolkit';
import {enableDebug, disableDebug} from './debug-actions';
import {getDebugInitialState} from './debug-state';

export const debugReducer = createReducer(getDebugInitialState(), (builder) => {
  builder.addCase(enableDebug, () => true).addCase(disableDebug, () => false);
});
