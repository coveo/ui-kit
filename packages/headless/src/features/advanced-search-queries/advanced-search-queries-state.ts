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
}

export const getAdvancedSearchQueriesInitialState: () => AdvancedSearchQueriesState = () => ({
  cq: '',
  cqWasSet: false,
  aq: '',
  aqWasSet: false,
});
