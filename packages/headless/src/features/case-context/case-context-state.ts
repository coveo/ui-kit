export interface CaseContextState {
  /**
   * The case context
   */
  caseContext: Record<string, string>;
}

/**
 * Get the initial state of case context
 * @returns Case Context State
 */
export const getCaseContextInitialState = (): CaseContextState => ({
  caseContext: {},
});
