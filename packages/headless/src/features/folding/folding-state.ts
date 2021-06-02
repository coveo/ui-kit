import {Result} from '../../api/search/search/result';

export type CollectionId = string;

export interface FoldedResult {
  /**
   * The result at this position in the collection.
   */
  result: Result;
  /**
   * The children of this result sorted in the same order as the search results.
   */
  children: FoldedResult[];
}

export interface FoldedCollection extends FoldedResult {
  /**
   * Whether more results might be available in the collection.
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
  filterFieldRange: number;
  collections: Record<CollectionId, FoldedCollection>;
}

export const getFoldingInitialState: () => FoldingState = () => ({
  enabled: false,
  fields: {
    collection: 'foldingcollection',
    parent: 'foldingparent',
    child: 'foldingchild',
  },
  filterFieldRange: 2,
  collections: {},
});
