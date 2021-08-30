import {createReducer} from '@reduxjs/toolkit';
import {Result} from '../../api/search/search/result';
import {isArray} from '../../utils/utils';
import {executeSearch, fetchMoreResults} from '../search/search-actions';
import {loadCollection, registerFolding} from './folding-actions';
import {
  FoldedCollection,
  CollectionId,
  FoldedResult,
  FoldingFields,
  getFoldingInitialState,
} from './folding-state';
import {getAllIncludedResultsFrom} from './folding-utils';

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

function resolveChildrenFromFields(
  parent: ResultWithFolding,
  results: ResultWithFolding[],
  fields: FoldingFields,
  resolvedAncestors: string[] = []
): FoldedResult[] {
  const sourceChildValue = getChildField(parent, fields);
  if (!sourceChildValue) {
    return [];
  }
  if (resolvedAncestors.indexOf(sourceChildValue) !== -1) {
    return [];
  }
  return results
    .filter((result) => {
      const isSameResultAsSource =
        getChildField(result, fields) === getChildField(parent, fields);
      const isChildOfSource =
        getParentField(result, fields) === sourceChildValue;
      return isChildOfSource && !isSameResultAsSource;
    })
    .map((result) => ({
      result,
      children: resolveChildrenFromFields(result, results, fields, [
        ...resolvedAncestors,
        sourceChildValue,
      ]),
    }));
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

function createCollectionFromResult(
  relevantResult: ResultWithFolding,
  fields: FoldingFields
): FoldedCollection {
  const resultsInCollection = getAllIncludedResultsFrom(relevantResult);

  const rootResult =
    resolveRootFromFields(resultsInCollection, fields) ?? relevantResult;

  return {
    result: rootResult,
    children: resolveChildrenFromFields(
      rootResult,
      resultsInCollection,
      fields
    ),
    moreResultsAvailable: true,
    isLoadingMoreResults: false,
  };
}

function createCollections(
  results: ResultWithFolding[],
  fields: FoldingFields
) {
  const collections: Record<CollectionId, FoldedCollection> = {};
  results.forEach((result) => {
    const collectionId = getCollectionField(result, fields);
    if (!collectionId) {
      return;
    }
    if (!getChildField(result, fields)) {
      return;
    }
    collections[collectionId] = createCollectionFromResult(result, fields);
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
              state.fields
            )
          : {};
      })
      .addCase(fetchMoreResults.fulfilled, (state, {payload}) => {
        state.collections = state.enabled
          ? {
              ...state.collections,
              ...createCollections(
                payload.response.results as ResultWithFolding[],
                state.fields
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
              filterFieldRange:
                payload.numberOfFoldedResults ?? state.filterFieldRange,
            }
      )
      .addCase(loadCollection.pending, (state, {meta}) => {
        const collectionId = meta.arg;
        state.collections[collectionId].isLoadingMoreResults = true;
      })
      .addCase(loadCollection.rejected, (state, {meta}) => {
        const collectionId = meta.arg;
        state.collections[collectionId].isLoadingMoreResults = false;
      })
      .addCase(
        loadCollection.fulfilled,
        (state, {payload: {collectionId, results}}) => {
          const rootResult = resolveRootFromFields(
            results as ResultWithFolding[],
            state.fields
          );
          if (!rootResult) {
            return;
          }
          state.collections[collectionId] = {
            result: rootResult,
            children: resolveChildrenFromFields(
              rootResult,
              results as ResultWithFolding[],
              state.fields
            ),
            moreResultsAvailable: false,
            isLoadingMoreResults: false,
          };
        }
      )
);
