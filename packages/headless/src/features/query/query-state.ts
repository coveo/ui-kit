export interface QueryState {
  /**
   * The basic query expression (e.g., `acme tornado seeds`).
   */
  q: string;
}

export const getQueryInitialState: () => QueryState = () => ({
  q: '',
});
