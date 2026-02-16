type AdvancedSearchQueriesDefaultFiltersState = {
  /**
   * The initial cq filter (for example, `((q AND aq) OR dq) AND cq).
   */
  cq: string;

  /**
   * The initial aq filter (for example, `((q AND aq) OR dq) AND cq).
   */
  aq: string;

  /**
   * The initial lq filter, or large query expression filter
   */
  lq: string;

  /**
   * The initial dq filter, or disjunction query expression filter (for example, `((q AND aq) OR dq) AND cq).
   */
  dq: string;
};

export interface AdvancedSearchQueriesState {
  /**
   * The cq filter (for example, `((q AND aq) OR dq) AND cq).
   */
  cq: string;

  /**
   * Whether the cq filter was manually set.
   *
   * If the cq was manually set and the cq is registered, the cq will not be overridden by the default filter.
   */
  cqWasSet: boolean;

  /**
   * The aq filter (for example, `((q AND aq) OR dq) AND cq).
   */
  aq: string;

  /**
   * Whether the aq filter was manually set.
   *
   * If the aq was manually set and the aq is registered, the aq will not be overridden by the default filter.
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
   * If the lq was manually set and the lq is registered, the lq will not be overridden by the default filter.
   */
  lqWasSet: boolean;

  /**
   * The dq filter, or disjunction query expression.
   *
   * This is the disjunctive part of the query expression that is merged with the other expression parts using an OR boolean operator (for example, `((q AND aq) OR dq) AND cq).
   */
  dq: string;
  /**
   * Whether the dq filter was manually set.
   *
   * If the dq was manually set and the dq is registered, the dq will not be overridden by the default filter.
   */
  dqWasSet: boolean;

  /**
   * The initial filters meant to be used as default values for the cq filter and aq filter.
   */
  defaultFilters: AdvancedSearchQueriesDefaultFiltersState;
}

export const getAdvancedSearchQueriesInitialState: () => AdvancedSearchQueriesState =
  () => ({
    cq: '',
    cqWasSet: false,
    aq: '',
    aqWasSet: false,
    lq: '',
    lqWasSet: false,
    dq: '',
    dqWasSet: false,
    defaultFilters: {
      cq: '',
      aq: '',
      lq: '',
      dq: '',
    },
  });
