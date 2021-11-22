export const getCaseAssistConfigurationInitialState =
  (): CaseAssistConfigurationState => ({
    caseAssistId: '',
    locale: 'en-US',
  });

export interface CaseAssistConfigurationState {
  /**
   * The unique identifier of the target case assist configuration. See [Retrieving a Case Assist ID](https://docs.coveo.com/en/3328/service/manage-case-assist-configurations#retrieving-a-case-assist-id).
   */
  caseAssistId: string;
  /**
   * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
   */
  locale?: string;
}
