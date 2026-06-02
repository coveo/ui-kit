import {createAction} from '@reduxjs/toolkit';
import type {SearchResult} from '@/src/core/interface/result-list/result-list-types.js';
import type {CoveoSearchResult} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

const ACTION_PREFIX = 'resultList';

export const setResults = createAction<SearchResult[]>(
  `${ACTION_PREFIX}/setResults`
);

export const clearResults = createAction(`${ACTION_PREFIX}/clearResults`);

export const setResultsFromResponse = createAction<CoveoSearchResult[]>(
  `${ACTION_PREFIX}/setResultsFromResponse`
);
