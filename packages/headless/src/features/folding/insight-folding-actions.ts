import {NumberValue, SchemaDefinition, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {isErrorResponse} from '../../api/search/search-api-client';
import {Result} from '../../api/search/search/result';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {
  ConfigurationSection,
  FoldingSection,
  InsightConfigurationSection,
  QuerySection,
} from '../../state/state-sections';
import {validatePayload} from '../../utils/validate-payload';
import {ResultWithFolding} from '../folding/folding-slice';
import {CollectionId} from '../folding/folding-state';
import {fetchFromAPI} from '../insight-search/insight-search-actions';
import {buildInsightSearchRequest} from '../insight-search/insight-search-request';

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
  QuerySection &
  InsightConfigurationSection;

export const loadCollection = createAsyncThunk<
  LoadCollectionFulfilledReturn,
  CollectionId,
  AsyncThunkInsightOptions<StateNeededByLoadCollection>
>(
  'folding/loadCollection',
  async (
    collectionId: CollectionId,
    {getState, rejectWithValue, extra: {apiClient}}
  ) => {
    const state = getState();
    const baseRequest = buildInsightSearchRequest(state);
    const actualRequest = {
      ...baseRequest,
      request: {
        ...baseRequest.request,
        filterFieldRange: 100,
        cq: `@${state.folding.fields.collection}="${collectionId}"`,
      },
    };
    const fetched = await fetchFromAPI(apiClient, state, actualRequest, {
      origin: 'foldingCollection',
    });
    const response = fetched.response;

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
