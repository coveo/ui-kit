export interface InsightCaseContextState {
  caseContext: Record<string, string>;
}

export const getInsightCaseContextSearchInitialState =
  (): InsightCaseContextState => ({
    caseContext: {},
  });
