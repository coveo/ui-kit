import {createSelector} from '@reduxjs/toolkit';
import type {SearchSection} from '../../state/state-sections.js';
import {getResultProperty} from '../result-templates/result-templates-helpers.js';
import type {SearchState} from './search-state.js';

export function firstSearchExecutedSelector(state: SearchSection) {
  return state.search.response.searchUid !== '';
}

export function resultFromFieldSelector(
  state: SearchSection,
  contentIdKey: string,
  contentIdValue: string
) {
  return state.search.results.find(
    (result) => getResultProperty(result, contentIdKey) === contentIdValue
  );
}

export const selectSearchActionCause = createSelector(
  (state: {search?: SearchState}) => state.search,
  (state) => {
    return state?.searchAction?.actionCause || '';
  }
);
