import {createReducer} from '@reduxjs/toolkit';
import {Result} from '../../api/search/search/result';
import {isArray, removeDuplicates} from '../../utils/utils';
import {executeSearch, fetchMoreResults} from '../search/search-actions';
import {loadCollection, registerFolding} from './folding-actions';
import {
  Collection,
  CollectionId,
  collectionMoreResultsAvailableBuffer,
  FoldedResult,
  FoldingFields,
  getFoldingInitialState,
} from './folding-state';

export interface ResultWithFolding extends Result {
  parentResult: ResultWithFolding | null;
  childResults: ResultWithFolding[];
}

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

function getChildResultsRecursively(
  result: ResultWithFolding
): ResultWithFolding[] {
  if (!result.childResults) {
    return [];
  }
  return result.childResults.flatMap((childResult) => [
    childResult,
    ...getChildResultsRecursively(childResult),
  ]);
}

function resolveChildrenFromFields(
  parent: ResultWithFolding,
  results: ResultWithFolding[],
  fields: FoldingFields
): FoldedResult[] {
  const sourceChildValue = getChildField(parent, fields);
  return sourceChildValue
    ? results
        .filter((result) => {
          const isSameResultAsSource =
            getChildField(result, fields) === getChildField(parent, fields);
          const isChildOfSource =
            getParentField(result, fields) === sourceChildValue;
          return isChildOfSource && !isSameResultAsSource;
        })
        .map((result) => ({
          ...result,
          children: resolveChildrenFromFields(result, results, fields),
        }))
    : [];
}

function resolveRootFromFields(
  results: ResultWithFolding[],
  fields: FoldingFields
) {
  return results.find((result) => {
    const hasNoParent = getParentField(result, fields) === undefined;
    const isParentOfItself = areDefinedAndEqual(
      getParentField(result, fields),
      getChildField(result, fields)
    );
    return hasNoParent || isParentOfItself;
  });
}

function getExpensiveFoldedResults(
  relevantResult: ResultWithFolding,
  foldedResults: ResultWithFolding[],
  parentResults: ResultWithFolding[]
) {
  const isIncludedForFree = (result: ResultWithFolding) =>
    relevantResult.uniqueId === result.uniqueId ||
    !!parentResults.find((parent) => parent.uniqueId === result.uniqueId);

  return foldedResults.filter((result) => !isIncludedForFree(result));
}

function getAllIncludedResultsFrom(
  relevantResult: ResultWithFolding,
  numberOfFoldedResults: number
) {
  const foldedResults = getChildResultsRecursively(relevantResult);

  const parentResults = [relevantResult, ...foldedResults]
    .filter((result) => result.parentResult)
    .map((result) => result.parentResult!);

  const expensiveFoldedResults = getExpensiveFoldedResults(
    relevantResult,
    foldedResults,
    parentResults
  );

  const moreResultsAvailable =
    expensiveFoldedResults.length > numberOfFoldedResults;

  const foldedResultsToDisplay = expensiveFoldedResults.slice(
    0,
    numberOfFoldedResults
  );

  const resultsInCollection = removeDuplicates(
    [relevantResult, ...foldedResultsToDisplay, ...parentResults],
    (result) => result.uniqueId
  );

  return {resultsInCollection, moreResultsAvailable};
}

function createCollectionFromResult(
  relevantResult: ResultWithFolding,
  fields: FoldingFields,
  numberOfFoldedResults: number
): Collection {
  const {resultsInCollection, moreResultsAvailable} = getAllIncludedResultsFrom(
    relevantResult,
    numberOfFoldedResults
  );

  const rootResult =
    resolveRootFromFields(resultsInCollection, fields) ?? relevantResult;

  return {
    ...rootResult,
    children: resolveChildrenFromFields(
      rootResult,
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
          const rootResult = resolveRootFromFields(
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
                ...rootResult,
                children: resolveChildrenFromFields(
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
