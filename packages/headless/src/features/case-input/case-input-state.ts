export const getCaseInputInitialState = (): CaseInputState => ({});

export interface CaseInput {
  value: string;
}

export interface CaseInputState {
  [fieldName: string]: CaseInput;
}
