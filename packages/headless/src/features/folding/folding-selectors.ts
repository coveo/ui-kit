import type {FoldingState} from './folding-state.js';

export const selectFoldingQueryParams = (state: {folding?: FoldingState}) => {
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
