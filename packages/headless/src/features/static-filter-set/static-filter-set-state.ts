export type StaticFilterSetState = Record<
  string,
  StaticFilterSlice | undefined
>;

export interface StaticFilterSlice {
  id: string;
  values: StaticFilterValue[];
}

export interface StaticFilterValue {
  /**
   * A human-readable caption for the expression.
   */
  caption: string;

  /**
   * The query filter expression to apply when the value is selected.
   */
  expression: string;

  /**
   * The state of the static filter value.
   */
  state: StaticFilterValueState;
}

export type StaticFilterValueState = 'idle' | 'selected';

export function getStaticFilterSetInitialState(): StaticFilterSetState {
  return {};
}
