export interface CaseContextState {
  /**
   * The case context
   */
  caseContext: Record<string, string>;
  /**
   * The case id
   */
  caseId: string;
  /**
   * The case number
   */
  caseNumber: string;
}

/**
 * Get the initial state of case context
 * @returns Case Context State
 */
export const getCaseContextInitialState = (): CaseContextState => ({
  caseContext: {},
  caseId: '',
  caseNumber: '',
});
