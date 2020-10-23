export interface AdvancedSearchQueriesState {
  /**
   * The cq filter (e.g., `((q AND aq) OR dq) AND cq).
   */
  cq: string;

  /**
   * The aq filter (e.g., `((q AND aq) OR dq) AND cq).
   */
  aq: string;
}

export const getAdvancedSearchQueriesInitialState: () => AdvancedSearchQueriesState = () => ({
  cq: '',
  aq: '',
});
