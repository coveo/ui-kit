import {createSelector} from '@reduxjs/toolkit';
import type {ExcerptLengthState} from './excerpt-length-state.js';

export const selectExcerptLength = createSelector(
  (state: {excerptLength?: ExcerptLengthState}) => state.excerptLength?.length,
  (excerptLength) => excerptLength
);
