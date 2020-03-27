import {Store} from 'redux';

declare class CoveoHeadlessEngine {
  get state(): CoveoHeadlessState;

  get reduxStore(): Store<CoveoHeadlessState>;

  updateQueryExpression(expression: string): void;
  performSearch(): void;
}

export {CoveoHeadlessEngine};

export interface CoveoHeadlessState {
  search: SearchState;
  results: ResultsState;
  query: QueryState;
}

export enum SearchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

interface ResultsState {
  list: SearchResult[];
  firstResult: number;
  numberOfResults: number;
}

interface SearchResult {
  title: string;
  uri: string;
  printableUri: string;
  clickUri: string;
  uniqueId: string;
  excerpt: string;
  flags: string;
  summary: string;
  queryUid?: string;
  pipeline?: string;
}

interface QueryState {
  expression: string;
}

interface SearchState {
  status: SearchStatus;
}
