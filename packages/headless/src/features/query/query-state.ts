export interface QueryState {
  /**
   * The basic query expression (e.g., `acme tornado seeds`).
   */
  q: string;
  /**
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/) in the query.
   */
  enableQuerySyntax: boolean;
}

export const getQueryInitialState: () => QueryState = () => ({
  q: '',
  enableQuerySyntax: false,
});
