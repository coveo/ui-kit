export interface CaseContextState {
  /**
   * the case context
   */
  caseContext: Record<string, string>;
}

/**
 * get the initial state of case context
 * @returns Case Context State
 */
export const getCaseContextInitialState = (): CaseContextState => ({
  caseContext: {},
});
