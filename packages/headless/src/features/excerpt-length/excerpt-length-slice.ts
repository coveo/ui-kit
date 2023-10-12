import {Reducer, createReducer} from '@reduxjs/toolkit';
import {setExcerptLength} from './excerpt-length-actions.js';
import {ExcerptLengthState, getExcerptLengthInitialState} from './excerpt-length-state.js';

export const excerptLengthReducer: Reducer<ExcerptLengthState> = createReducer(
  getExcerptLengthInitialState(),
  (builder) => {
    builder.addCase(setExcerptLength, (state, action) => {
      state.length = action.payload;
    });
  }
);
