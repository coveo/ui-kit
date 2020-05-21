import {QuerySuggestCompletion} from './api/search/query-suggest/query-suggest-response';

export interface HeadlessState {
  query: QueryState;
  configuration: ConfigurationState;
  redirection: RedirectionState;
  querySuggest: QuerySuggestSet;
}

export interface ConfigurationState {
  organizationId: string;
  accessToken: string;
  search: {
    endpoint: string;
  };
}

export interface QueryState {
  q: string;
}

export interface RedirectionState {
  redirectTo: string | null;
}

export type QuerySuggestSet = Record<string, QuerySuggestState | undefined>;

export interface QuerySuggestState {
  id: string;
  completions: QuerySuggestCompletion[];
  count: number;
  q: string;
  currentRequestId: string;
}
