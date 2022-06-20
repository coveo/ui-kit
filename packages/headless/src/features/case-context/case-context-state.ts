export interface CaseContextState {
  caseContext: Record<string, string>;
}

export const getCaseContexttInitialState = (): CaseContextState => ({
  caseContext: {},
});
