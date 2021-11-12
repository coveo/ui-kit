export const getCaseAssistInitialState = (): CaseAssistState => ({
  caseAssistId: 'CaseAssist',
});

export interface CaseAssistState {
  /**
   * Specifies the ID of the recommendation interface.
   * @defaultValue `Recommendation`
   */
  caseAssistId: string;
}
