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

type FacetValueState = 'idle' | 'selected';

type FacetManagerPayload = {
  facetId: string;
  payload: HTMLElement;
};

export type FacetManager = {
  sort(payload: FacetManagerPayload[]): FacetManagerPayload[];
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

export type FacetValueRequest = {
  value: string;
  children?: FacetValueRequest;
  state: FacetValueState;
  retrieveChildren: boolean;
  retrieveCount: number;
};

export type CategoryFacetValueRequest = {
  state: FacetValueState;
  value: string;
  children: CategoryFacetValueRequest[];
};

export type QuerySummary = {
  state: {
    total: number;
  };
};
