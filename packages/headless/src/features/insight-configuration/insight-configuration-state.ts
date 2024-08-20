export const getInsightConfigurationInitialState =
  (): InsightConfigurationState => ({
    insightId: '',
    search: {
      locale: 'en-US',
    },
  });

export interface InsightConfigurationState {
  /**
   * The unique identifier of the target insight configuration.
   */
  insightId: string;
  /**
   * The configuration for the insight search.
   */
  search: {
    /**
     * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
     */
    locale: string;
  };
}
