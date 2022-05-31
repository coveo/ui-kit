export const getInsightConfigurationInitialState =
  (): InsightConfigurationState => ({
    insightId: '',
  });

export interface InsightConfigurationState {
  /**
   * The unique identifier of the target insight configuration.
   */
  insightId: string;
}
