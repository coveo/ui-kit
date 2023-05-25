import {NumberValue, SchemaDefinition, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {Result} from '../../api/search/search/result';
import {
  ConfigurationSection,
  FoldingSection,
  QuerySection,
} from '../../state/state-sections';
import {validatePayload} from '../../utils/validate-payload';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request';
import {ResultWithFolding} from './folding-slice';
import {CollectionId} from './folding-state';

export interface RegisterFoldingActionCreatorPayload {
  /**
   * The name of the field on which to do the folding. The folded result list component will use the values of this field to resolve the collections of result items.
   *
   * @defaultValue `foldingcollection`
   */
  collectionField?: string;
  /**
   * The name of the field that determines whether a certain result is a top result containing other child results within a collection.
   *
   * @defaultValue `foldingparent`
   */
  parentField?: string;
  /**
   * The name of the field that uniquely identifies a result within a collection.
   *
   * @defaultValue `foldingchild`
   */
  childField?: string;
  /**
   * The number of child results to fold under the root collection element, before expansion.
   *
   * @defaultValue `2`
   */
  numberOfFoldedResults?: number;
}

export interface LoadCollectionFulfilledReturn {
  results: Result[];
  collectionId: CollectionId;
  rootResult: ResultWithFolding;
}

export const foldingOptionsSchemaDefinition: SchemaDefinition<
  Required<RegisterFoldingActionCreatorPayload>
> = {
  collectionField: new StringValue({emptyAllowed: false, required: false}),
  parentField: new StringValue({emptyAllowed: false, required: false}),
  childField: new StringValue({emptyAllowed: false, required: false}),
  numberOfFoldedResults: new NumberValue({min: 0, required: false}),
};

export const registerFolding = createAction(
  'folding/register',
  (payload: RegisterFoldingActionCreatorPayload) =>
    validatePayload(payload, foldingOptionsSchemaDefinition)
);

export type StateNeededByLoadCollection = ConfigurationSection &
  FoldingSection &
  QuerySection;

export const loadCollection = createAsyncThunk<
  LoadCollectionFulfilledReturn,
  CollectionId,
  AsyncThunkSearchOptions<StateNeededByLoadCollection>
>(
  'folding/loadCollection',
  async (
    collectionId: CollectionId,
    {getState, rejectWithValue, extra: {apiClient}}
  ) => {
    const state = getState();
    const sharedWithSearchRequest =
      await buildSearchAndFoldingLoadCollectionRequest(state);

    const response = await apiClient.search(
      {
        ...sharedWithSearchRequest,
        q: getQForHighlighting(state),
        enableQuerySyntax: true,
        cq: `@${state.folding.fields.collection}="${collectionId}"`,
        filterField: state.folding.fields.collection,
        childField: state.folding.fields.parent,
        parentField: state.folding.fields.child,
        filterFieldRange: 100,
      },
      {origin: 'foldingCollection'}
    );

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    return {
      collectionId,
      results: response.success.results,
      rootResult: state.folding.collections[collectionId]!
        .result as ResultWithFolding,
    };
  }
);

function getQForHighlighting(state: StateNeededByLoadCollection) {
  // This piece of code serves the following purpose:
  // Inject the "original" query "q" to get proper keywords highlighting when loading a full collection
  // However, the intent behind this feature is to load "every results available for this collection", regardless of other end user filters (including the search box itself)
  // For that reason, we force enable query syntax + inject an `OR @uri` expression in the query.

  if (state.query.q === '') {
    return '';
  }

  return state.query.enableQuerySyntax
    ? `${state.query.q} OR @uri`
    : `( <@- ${state.query.q} -@> ) OR @uri`;
}
