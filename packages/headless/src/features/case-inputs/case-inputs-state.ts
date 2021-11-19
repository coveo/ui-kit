export const getCaseInputsInitialState = (): CaseInputsState => ({});

export interface CaseInput {
  value: string;
}

export interface CaseInputsState {
  [fieldName: string]: CaseInput;
}
