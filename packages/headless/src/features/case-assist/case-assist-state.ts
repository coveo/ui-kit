export const getCaseAssistInitialState = (): CaseAssistState => ({
  caseAssistId: 'CaseAssist',
});

export interface CaseAssistState {
  /**
   * Specifies the ID of the case assist configuration.
   * @defaultValue `CaseAssist`
   */
  caseAssistId: string;
}
