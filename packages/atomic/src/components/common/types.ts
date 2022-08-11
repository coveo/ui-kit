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

export type FacetValue = {
  value: string;
  numberOfResults: number;
  state: FacetValueState;
};

export type FacetSearchState = {
  query: string;
  values: CategoryFacetSearchResult[];
  moreValuesAvailable: boolean;
  isLoading: boolean;
};

export type FacetState = {
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

export type DateFacetState = {
  facetId: string;
  enabled: boolean;
  values: DateFacetValue[];
};

export type DateFacet = {
  state: DateFacetState;
  toggleSingleSelect(value: DateFacetValue): void;
  deselectAll(): void;
};

type Range<T = string | number> = {
  start: T;
  end: T;
  endInclusive: boolean;
};

export type DateFacetValue = Range<string> & {
  state: FacetValueState;
  numberOfResults: number;
};

export type DateRangeOptions = {
  start: RelativeDate;
  end: RelativeDate;
};

export type DateRangeRequest = Range<string> & {
  state: FacetValueState;
};

export type DateFilterState = {
  enabled: boolean;
  facetId: string;
  isLoading: boolean;
  range?: DateFacetValue;
};

export type DateFilter = {
  state: DateFilterState;
  clear(): void;
  setRange(range: Range<string>): boolean;
  enable(): void;
  disable(): void;
  subscribe(listener: () => void): () => void;
};

export type QuerySummary = {
  state: {
    total: number;
  };
};

export type NumericFacetValue = Range<number> & {
  state: FacetValueState;
  numberOfResults: number;
};

export type NumericFacetState = {
  facetId: string;
  enabled: boolean;
  values: NumericFacetValue[];
};

export type NumericFacet = {
  state: NumericFacetState;
  toggleSelect(value: NumericFacetValue): void;
  toggleSingleSelect(value: NumericFacetValue): void;
  deselectAll(): void;
};

export type NumericFilterState = {
  facetId: string;
  enabled: boolean;
  isLoading: boolean;
  range?: NumericFacetValue;
};

export type NumericFilter = {
  state: NumericFilterState;
  clear(): void;
  setRange(range: {start: number; end: number}): boolean;
  enable(): void;
  disable(): void;
  subscribe(listener: () => void): () => void;
};

export type NumericRangeOptions = Range<number>;
export type NumericRangeRequest = Range<number> & {
  state: FacetValueState;
};

type CategoryFacetSearchResult = {
  displayValue: string;
  rawValue: string;
  count: number;
  path: string[];
};

export type CategoryFacetSearch = {
  updateText(text: string): void;
  showMoreResults(): void;
  search(): void;
  select(value: CategoryFacetSearchResult): void;
  clear(): void;
  updateCaptions(captions: Record<string, string>): void;
};

export type CategoryFacet = {
  facetSearch: CategoryFacetSearch;
  state: CategoryFacetState;
};

export type CategoryFacetState = {
  facetSearch: {
    values: CategoryFacetSearchResult[];
    isLoading: boolean;
    moreValuesAvailable: boolean;
    query: string;
  };
};

export type CategoryFacetSortCriterion = 'alphanumeric' | 'occurrences';
export type RangeFacetSortCriterion = 'ascending' | 'descending';
