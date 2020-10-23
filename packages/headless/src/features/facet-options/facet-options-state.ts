import {FacetOptions} from './facet-options';

export type FacetOptionsState = FacetOptions;

export function getFacetOptionsInitialState(): FacetOptionsState {
  return {
    freezeFacetOrder: false,
  };
}
