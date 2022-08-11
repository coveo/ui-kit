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

export type FacetSortCriterion =
  | 'score'
  | 'alphanumeric'
  | 'occurrences'
  | 'automatic';

type FacetValueState = 'idle' | 'selected';

type CategoryFacetSearchResult = {
  displayValue: string;
  rawValue: string;
  count: number;
};

export type FacetValue = {
  state: FacetValueState;
  numberOfResults: number;
  value: string;
};

export type FacetSearchState = {
  query: string;
  values: CategoryFacetSearchResult[];
  moreValuesAvailable: boolean;
  isLoading: boolean;
};

type FacetState = {
  values: FacetValue[];
  enabled: boolean;
  facetSearch: FacetSearchState;
  canShowMoreValues: boolean;
  canShowLessValues: boolean;
};

export type Facet = {
  state: FacetState;
  facetSearch: {
    clear(): void;
    search(): void;

    singleSelect(value: CategoryFacetSearchResult): void;
    select(value: CategoryFacetSearchResult): void;
    updateCaptions(captions: any): void;
    updateText(value: string): void;
  };
  toggleSingleSelect(value: FacetValue): void;
  toggleSelect(value: FacetValue): void;
  showMoreValues(): void;
  showLessValues(): void;
  deselectAll(): void;
};

type FacetManagerPayload = {
  facetId: string;
  payload: HTMLElement;
};

export type FacetManager = {
  sort(payload: FacetManagerPayload[]): FacetManagerPayload[];
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

export type RelativeDatePeriod = 'past' | 'now' | 'next';

export type RelativeDateUnit =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export type RelativeDate = {
  period: RelativeDatePeriod;
  unit?: RelativeDateUnit;
  amount?: number;
};

export type DateFacet = {
  state: {
    facetId: string;
    enabled: boolean;
    values: DateFacetValue[];
  };
  toggleSingleSelect(value: DateFacetValue): void;
  deselectAll(): void;
};

export type DateFacetValue = {
  state: FacetValueState;
  numberOfResults: number;
  start: string;
  end: string;
  endInclusive: boolean;
};

export type DateRangeOptions = {
  start: RelativeDate;
  end: RelativeDate;
};

export type DateRangeRequest = {
  state: FacetValueState;
  start: string;
  end: string;
  endInclusive: boolean;
};

export type DateFilter = {
  state: {
    enabled: boolean;
    facetId: string;
    isLoading: boolean;
    range?: DateFacetValue;
  };
  clear(): void;
  setRange(range: {start: string; end: string; endInclusive: boolean}): boolean;
  enable(): void;
  disable(): void;
  subscribe(listener: () => void): () => void;
};

export type NumericFacetValue = {
  state: FacetValueState;
  end: number;
  start: number;
  numberOfResults: number;
  endInclusive: boolean;
};

export type QuerySummary = {
  state: {
    total: number;
  };
};
