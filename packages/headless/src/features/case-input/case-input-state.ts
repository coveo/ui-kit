export const getCaseInputInitialState = (): CaseInputState => ({});

interface CaseInput {
  value: string;
}

export interface CaseInputState {
  [fieldName: string]: CaseInput;
}
