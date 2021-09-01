export interface AdvancedSearchQueriesDefaultFiltersState {
  /**
   * The initial cq filter (e.g., `((q AND aq) OR dq) AND cq).
   */
  cq: string;

  /**
   * The initial aq filter (e.g., `((q AND aq) OR dq) AND cq).
   */
  aq: string;

  /**
   * The initial lq filter, or large query expression filter
   */
  lq: string;
}

export interface AdvancedSearchQueriesState {
  /**
   * The cq filter (e.g., `((q AND aq) OR dq) AND cq).
   */
  cq: string;

  /**
   * Whether the cq filter was manually set.
   *
   * If the cq was manually set and the cq is registered, the cq will not be overriden by the default filter.
   */
  cqWasSet: boolean;

  /**
   * The aq filter (e.g., `((q AND aq) OR dq) AND cq).
   */
  aq: string;

  /**
   * Whether the aq filter was manually set.
   *
   * If the aq was manually set and the aq is registered, the aq will not be overriden by the default filter.
   */
  aqWasSet: boolean;

  /**
   * The lq filter, or large query expression filter.
   *
   * The large query expression (lq) is a part of the combined query expression which typically contains a case
   * description, a long textual query, or any other form of text that can help refine a query.
   */
  lq: string;

  /**
   * Whether the lq filter was manually set.
   *
   * If the lq was manually set and the lq is registered, the lq will not be overriden by the default filter.
   */
  lqWasSet: boolean;

  /**
   * The initial filters meant to be used as default values for the cq filter and aq filter.
   */
  defaultFilters: AdvancedSearchQueriesDefaultFiltersState;
}

export const getAdvancedSearchQueriesInitialState: () => AdvancedSearchQueriesState = () => ({
  cq: '',
  cqWasSet: false,
  aq: '',
  aqWasSet: false,
  lq: '',
  lqWasSet: false,
  defaultFilters: {
    cq: '',
    aq: '',
    lq: '',
  },
});
