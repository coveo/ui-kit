import {createSelector} from '@reduxjs/toolkit';

export const selectPipeline = createSelector(
  (state: {pipeline?: string}) => state.pipeline,
  (pipeline) => pipeline
);
