export type SearchStatusState = {
  hasResults: boolean;
};

export type SearchStatus = {
  state: SearchStatusState;
};

export type Pager = {
  isCurrentPage(page: number): boolean;
  selectPage(page: number): void;
  previousPage(): void;
  nextPage(): void;
  state: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPages: number[];
  };
};

type FacetManagerPayload = {
  facetId: string;
  payload: HTMLElement;
};

export type FacetManager = {
  sort(payload: FacetManagerPayload[]): FacetManagerPayload[];
};

export type QuerySummary = {
  state: {
    total: number;
  };
};

export type FacetSearchState = {
  values: {displayValue: string; rawValue: string; count: number}[];
  isLoading: boolean;
  moreValuesAvailable: boolean;
  query: string;
};

export type FacetConditionsManager = {
  stopWatching(): void;
};
