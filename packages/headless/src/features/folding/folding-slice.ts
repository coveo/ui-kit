import {createReducer} from '@reduxjs/toolkit';
import {Result} from '../../api/search/search/result';
import {isArray, removeDuplicates} from '../../utils/utils';
import {executeSearch, fetchMoreResults} from '../search/search-actions';
import {loadCollection, registerFolding} from './folding-actions';
import {
  Collection,
  CollectionId,
  FoldedResult,
  FoldingFields,
  getFoldingInitialState,
} from './folding-state';

export interface ResultWithFolding extends Result {
  parentResult: ResultWithFolding | null;
  childResults: ResultWithFolding[];
}

const collectionMoreResultsAvailableBuffer = 1;

function getCollectionField(result: ResultWithFolding, fields: FoldingFields) {
  return result.raw[fields.collection] as string | undefined;
}

function getParentField(result: ResultWithFolding, fields: FoldingFields) {
  return result.raw[fields.parent] as string | undefined;
}

function getChildField(result: ResultWithFolding, fields: FoldingFields) {
  const rawValue = result.raw[fields.child] as string | [string] | undefined;
  if (isArray(rawValue)) {
    return rawValue[0];
  }
  return rawValue;
}

function areDefinedAndEqual<T>(
  value1: T | undefined,
  value2: T | undefined
): boolean {
  return (value1 || value2) !== undefined && value1 === value2;
}

function getFoldedResults(result: ResultWithFolding): ResultWithFolding[] {
  if (!result.childResults) {
    return [];
  }
  return result.childResults.flatMap((childResult) => [
    childResult,
    ...getFoldedResults(childResult),
  ]);
}

function withChildren(
  parent: ResultWithFolding,
  results: ResultWithFolding[],
  fields: FoldingFields
): FoldedResult {
  const sourceChildValue = getChildField(parent, fields);
  return {
    ...parent,
    children: sourceChildValue
      ? results
          .filter((result) => {
            const isSameResultAsSource =
              getChildField(result, fields) === getChildField(parent, fields);
            const isChildOfSource =
              getParentField(result, fields) === sourceChildValue;
            return isChildOfSource && !isSameResultAsSource;
          })
          .map((result) => withChildren(result, results, fields))
      : [],
  };
}

function getRootResult(results: ResultWithFolding[], fields: FoldingFields) {
  return results.find((result) => {
    const hasNoParent = getParentField(result, fields) === undefined;
    const isParentOfItself = areDefinedAndEqual(
      getParentField(result, fields),
      getChildField(result, fields)
    );
    return hasNoParent || isParentOfItself;
  });
}

function createCollectionFromResult(
  relevantResult: ResultWithFolding,
  fields: FoldingFields,
  numberOfFoldedResults: number
): Collection {
  const foldedResults = getFoldedResults(relevantResult);

  const moreResultsAvailable = foldedResults.length > numberOfFoldedResults;

  const parentResults = [relevantResult, ...foldedResults]
    .filter((result) => result.parentResult)
    .map((result) => result.parentResult!);

  const foldedResultsWithoutBuffer = foldedResults.slice(
    0,
    numberOfFoldedResults
  );

  const resultsInCollection = removeDuplicates(
    [relevantResult, ...foldedResultsWithoutBuffer, ...parentResults],
    (result) => result.uniqueId
  );

  return {
    ...withChildren(
      getRootResult(resultsInCollection, fields) ?? relevantResult,
      resultsInCollection,
      fields
    ),
    moreResultsAvailable,
    isLoadingMoreResults: false,
  };
}

function createCollections(
  results: ResultWithFolding[],
  fields: FoldingFields,
  numberOfFoldedResults: number
) {
  const collections: Record<CollectionId, Collection> = {};
  results.forEach((result) => {
    const collectionId = getCollectionField(result, fields);
    if (!collectionId) {
      return;
    }
    collections[collectionId] = createCollectionFromResult(
      result,
      fields,
      numberOfFoldedResults
    );
  });
  return collections;
}

export const foldingReducer = createReducer(
  getFoldingInitialState(),
  (builder) =>
    builder
      .addCase(executeSearch.fulfilled, (state, {payload}) => {
        state.collections = state.enabled
          ? createCollections(
              payload.response.results as ResultWithFolding[],
              state.fields,
              state.filterFieldRange - collectionMoreResultsAvailableBuffer
            )
          : {};
      })
      .addCase(fetchMoreResults.fulfilled, (state, {payload}) => {
        state.collections = state.enabled
          ? {
              ...state.collections,
              ...createCollections(
                payload.response.results as ResultWithFolding[],
                state.fields,
                state.filterFieldRange - collectionMoreResultsAvailableBuffer
              ),
            }
          : {};
      })
      .addCase(registerFolding, (state, {payload}) =>
        state.enabled
          ? state
          : {
              enabled: true,
              collections: {},
              fields: {
                collection: payload.collectionField ?? state.fields.collection,
                parent: payload.parentField ?? state.fields.parent,
                child: payload.childField ?? state.fields.child,
              },
              filterFieldRange: payload.numberOfFoldedResults
                ? payload.numberOfFoldedResults +
                  collectionMoreResultsAvailableBuffer
                : state.filterFieldRange,
            }
      )
      .addCase(loadCollection.pending, (state, {meta}) => {
        const collectionId = meta.arg;

        return {
          ...state,
          collections: {
            ...state.collections,
            [collectionId]: {
              ...state.collections[collectionId],
              isLoadingMoreResults: true,
            },
          },
        };
      })
      .addCase(loadCollection.rejected, (state, {payload}) => ({
        ...state,
        collections: {
          ...state.collections,
          [payload!.collectionId]: {
            ...state.collections[payload!.collectionId],
            isLoadingMoreResults: false,
          },
        },
      }))
      .addCase(
        loadCollection.fulfilled,
        (state, {payload: {collectionId, results}}) => {
          const rootResult = getRootResult(
            results as ResultWithFolding[],
            state.fields
          );
          if (!rootResult) {
            return state;
          }
          return {
            ...state,
            collections: {
              ...state.collections,
              [collectionId]: {
                ...withChildren(
                  rootResult,
                  results as ResultWithFolding[],
                  state.fields
                ),
                moreResultsAvailable: false,
                isLoadingMoreResults: false,
              },
            },
          };
        }
      )
);
