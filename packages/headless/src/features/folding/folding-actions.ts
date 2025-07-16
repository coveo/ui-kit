import {NumberValue, type SchemaDefinition, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {Result} from '../../api/search/search/result.js';
import {
  type AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client.js';
import type {
  ConfigurationSection,
  FoldingSection,
  QuerySection,
} from '../../state/state-sections.js';
import {validatePayload} from '../../utils/validate-payload.js';
import {buildSearchAndFoldingLoadCollectionRequest as legacyBuildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/legacy/search-and-folding-request.js';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request.js';
import type {ResultWithFolding} from './folding-slice.js';
import type {CollectionId} from './folding-state.js';

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
  searchUid: string;
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
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    const state = getState();
    const sharedWithSearchRequest =
      state.configuration.analytics.analyticsMode === 'legacy'
        ? await legacyBuildSearchAndFoldingLoadCollectionRequest(state)
        : buildSearchAndFoldingLoadCollectionRequest(state, navigatorContext);

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
      searchUid: response.success.searchUid,
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
