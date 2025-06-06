import {createSelector} from '@reduxjs/toolkit';
import {ContextState} from './context-state.js';

export const selectContext = createSelector(
  (state: {context?: ContextState}) => state.context,
  (context) => context
);
