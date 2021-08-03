import {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions';

export type StandaloneSearchBoxSetState = Record<
  string,
  StandaloneSearchBoxEntry | undefined
>;

export type StandaloneSearchBoxEntry = {
  defaultRedirectionUrl: string;
  analytics: InitialData | SearchFromLinkData | OmniboxFromLinkData;
  redirectTo: string;
  isLoading: boolean;
};

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

export function getStandaloneSearchBoxInitialState(): StandaloneSearchBoxSetState {
  return {};
}
