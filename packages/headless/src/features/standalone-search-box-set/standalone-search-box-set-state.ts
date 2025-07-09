import type {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions.js';

export type StandaloneSearchBoxSetState = Record<
  string,
  StandaloneSearchBoxEntry | undefined
>;

export type StandaloneSearchBoxEntry = {
  defaultRedirectionUrl: string;
  analytics: StandaloneSearchBoxAnalytics;
  redirectTo: string;
  isLoading: boolean;
};

export type StandaloneSearchBoxAnalytics =
  | InitialData
  | SearchFromLinkData
  | OmniboxFromLinkData;

interface InitialData {
  cause: '';
  metadata: null;
}

interface SearchFromLinkData {
  cause: 'searchFromLink';
  metadata: null;
}

interface OmniboxFromLinkData {
  cause: 'omniboxFromLink';
  metadata: OmniboxSuggestionMetadata;
}

export function getStandaloneSearchBoxSetInitialState(): StandaloneSearchBoxSetState {
  return {};
}
