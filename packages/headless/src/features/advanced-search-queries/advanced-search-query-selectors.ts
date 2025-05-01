import {createSelector} from '@reduxjs/toolkit';
import {isEmptyString} from '../../utils/utils.js';
import {AdvancedSearchQueriesState} from './advanced-search-queries-state.js';

export const selectAdvancedSearchQueries = createSelector(
  (state: {advancedSearchQueries?: AdvancedSearchQueriesState}) =>
    state.advancedSearchQueries,
  (advancedSearchQueries) => {
    if (!advancedSearchQueries) {
      return {};
    }
    const {aq, cq, dq, lq} = advancedSearchQueries;
    return {
      aq: !isEmptyString(aq) ? aq : undefined,
      cq: !isEmptyString(cq) ? cq : undefined,
      dq: !isEmptyString(dq) ? dq : undefined,
      lq: !isEmptyString(lq) ? lq : undefined,
    };
  }
);
