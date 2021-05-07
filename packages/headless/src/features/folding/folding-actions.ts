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

export interface RegisterFoldingPayload {
  collectionField?: string;
  parentField?: string;
  childField?: string;
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
  RegisterFoldingPayload
>> = {
  collectionField: new StringValue(),
  parentField: new StringValue(),
  childField: new StringValue(),
  numberOfFoldedResults: new NumberValue({min: 0}),
};

export const registerFolding = createAction(
  'folding/register',
  (payload: RegisterFoldingPayload) =>
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
