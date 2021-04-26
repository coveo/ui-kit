import {Result} from '../../api/search/search/result';

export interface FoldedResult extends Result {
  /**
   * The unsorted children of this result.
   */
  children: FoldedResult[];
}

export interface FoldingFields {
  collection: string;
  parent: string;
  child: string;
}

export interface FoldingState {
  enabled: boolean;
  fields: FoldingFields;
  numberOfFoldedResults: number;
  collections: FoldedResult[];
}

export const getFoldingInitialState: () => FoldingState = () => ({
  enabled: false,
  fields: {
    collection: 'foldingcollection',
    parent: 'foldingparent',
    child: 'foldingchild',
  },
  numberOfFoldedResults: 2,
  collections: [],
});
