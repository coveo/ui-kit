import {FacetValueState} from '../facets/facet-api/value';

export type StaticFilterSetState = Record<string, StaticFilterSlice>;

export interface StaticFilterSlice {
  id: string;
  values: StaticFilterValue[];
}

export interface StaticFilterValue {
  /**
   * A human-readable caption for the expression (e.g., `Youtube`).
   */
  caption: string;

  /**
   * The query filter expression to apply when the value is selected (e.g., `@filetype=="youtubevideo"`).
   */
  expression: string;

  /**
   * The state of the static filter value. The possible values are `idle`, `selected`, `excluded`.
   */
  state: StaticFilterValueState;
}

export type StaticFilterValueState = FacetValueState;

export function getStaticFilterSetInitialState(): StaticFilterSetState {
  return {};
}
