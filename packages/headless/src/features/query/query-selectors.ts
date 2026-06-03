import type {QueryState} from './query-state.js';

export const selectQuery = (state: {query?: QueryState}) => state.query;

export const selectEnableQuerySyntax = (state: {query?: QueryState}) =>
  state.query?.enableQuerySyntax;
