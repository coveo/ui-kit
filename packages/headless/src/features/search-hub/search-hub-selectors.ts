import {createSelector} from '@reduxjs/toolkit';

export const selectSearchHub = createSelector(
  (state: {searchHub?: string}) => state.searchHub,
  (searchHub) => searchHub
);
