import {NumberValue, SchemaDefinition, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {Result} from '../../api/search/search/result';
import {ConfigurationSection, FoldingSection} from '../../state/state-sections';
import {validatePayload} from '../../utils/validate-payload';

export const collectionMoreResultsAvailableBuffer = 1;

export type CollectionId = string;

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

export interface LoadAllFulfilledReturn {
  results: Result[];
  collectionId: CollectionId;
}

export interface LoadAllRejectedReturn {
  collectionId: CollectionId;
  error: SearchAPIErrorWithStatusCode;
}

export const foldingOptionsSchemaDefinition: SchemaDefinition<Required<
  RegisterFoldingActionCreatorPayload
>> = {
  collectionField: new StringValue(),
  parentField: new StringValue(),
  childField: new StringValue(),
  numberOfFoldedResults: new NumberValue({min: 0}),
};

export const registerFolding = createAction(
  'folding/register',
  (payload: RegisterFoldingActionCreatorPayload) =>
    validatePayload(payload, foldingOptionsSchemaDefinition)
);

export const loadAll = createAsyncThunk<
  LoadAllFulfilledReturn,
  CollectionId,
  AsyncThunkSearchOptions<
    ConfigurationSection & FoldingSection,
    LoadAllRejectedReturn
  >
>(
  'folding/loadAll',
  async (
    collectionId: CollectionId,
    {getState, rejectWithValue, extra: {searchAPIClient}}
  ) => {
    const {
      folding: {fields},
      configuration: {
        accessToken,
        organizationId,
        search: {apiBaseUrl},
      },
    } = getState();

    const response = await searchAPIClient.search({
      accessToken,
      organizationId,
      url: apiBaseUrl,
      aq: `@${fields.collection} = ${collectionId}`,
      numberOfResults: 100,
    });

    if (isErrorResponse(response)) {
      return rejectWithValue({collectionId, error: response.error});
    }

    return {collectionId, results: response.success.results};
  }
);
