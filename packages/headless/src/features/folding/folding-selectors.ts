import type {FoldingState} from './folding-state.js';

export interface FoldingQueryParams {
  filterField: string;
  childField: string;
  parentField: string;
  filterFieldRange: number;
}

export const selectFoldingQueryParams = (state: {
  folding?: FoldingState;
}): FoldingQueryParams | undefined => {
  if (!state.folding) {
    return undefined;
  }

  return {
    filterField: state.folding.fields.collection,
    childField: state.folding.fields.parent,
    parentField: state.folding.fields.child,
    filterFieldRange: state.folding.filterFieldRange,
  };
};
