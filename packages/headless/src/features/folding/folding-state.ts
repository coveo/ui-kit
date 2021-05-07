import {Result} from '../../api/search/search/result';

export interface FoldedResult extends Result {
  /**
   * The children of this result sorted in the same order as the search results.
   */
  children: FoldedResult[];
}

export interface Collection extends FoldedResult {
  /**
   * Whether more results are available in the collection.
   */
  moreResultsAvailable: boolean;
  /**
   * Whether there is an ongoing query to add more results to the collection.
   */
  isLoadingMoreResults: boolean;
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
  collections: Collection[];
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
