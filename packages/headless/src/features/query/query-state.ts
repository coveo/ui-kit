export interface QueryState {
  /**
   * The basic query expression (for example, `acme tornado seeds`).
   */
  q: string;
  /**
   * Whether to interpret advanced [Coveo query syntax](https://docs.coveo.com/en/1552/) in the query.
   */
  enableQuerySyntax: boolean;
}

export const getQueryInitialState: () => QueryState = () => ({
  q: '',
  enableQuerySyntax: false,
});
