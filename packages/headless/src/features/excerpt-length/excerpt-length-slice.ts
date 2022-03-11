import {createReducer} from '@reduxjs/toolkit';
import {setExcerptLength} from './excerpt-length-actions';
import {getExcerptLengthInitialState} from './excerpt-length-state';

export const excerptLengthReducer = createReducer(
  getExcerptLengthInitialState(),
  (builder) => {
    builder.addCase(setExcerptLength, (state, action) => {
      state.length = action.payload;
    });
  }
);
