export interface ExcerptLengthState {
  length?: number;
}

export function getExcerptLengthInitialState(): ExcerptLengthState {
  return {
    length: undefined,
  };
}
