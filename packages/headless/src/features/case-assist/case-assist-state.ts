export interface CaseAssistState {
  classifications: {[field: string]: string[]};
}

export function getCaseAssistInitialState(): CaseAssistState {
  return {
    classifications: {},
  };
}
