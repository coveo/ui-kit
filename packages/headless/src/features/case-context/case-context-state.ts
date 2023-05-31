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

/**
 * Return the case context metadata to be sent in the analytics
 * @param state - The case context state
 * @returns Case context metadata
 */
export const getCaseContextAnalyticsMetadata = (
  state: CaseContextState | undefined
) => {
  return {
    caseContext: state?.caseContext || {},
    caseId: state?.caseId,
    caseNumber: state?.caseNumber,
  };
};
