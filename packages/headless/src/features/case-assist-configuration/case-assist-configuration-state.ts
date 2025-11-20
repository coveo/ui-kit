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
  /**
   * The base URL to use to proxy Coveo case assist requests (for example, `https://example.com/search`).
   *
   * This is an advanced option that you only set if you proxy Coveo case assist through your own
   * server. In most cases, you should not set this option.
   *
   *  See [Headless proxy: Case Assist](https://docs.coveo.com/en/headless/latest/usage/proxy#case-assist).
   */
  apiBaseUrl?: string;
}
