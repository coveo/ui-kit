import {createReducer} from '@reduxjs/toolkit';
import {Result} from '../../api/search/search/result.js';
import {isArray} from '../../utils/utils.js';
import {
  executeSearch,
  fetchMoreResults,
  fetchPage,
} from '../search/search-actions.js';
import {loadCollection, registerFolding} from './folding-actions.js';
import {
  FoldedCollection,
  CollectionId,
  FoldedResult,
  FoldingFields,
  getFoldingInitialState,
  FoldingState,
} from './folding-state.js';
import {getAllIncludedResultsFrom} from './folding-utils.js';

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

function resolveRootFromParentResult(
  result: ResultWithFolding
): ResultWithFolding {
  if (result.parentResult) {
    return resolveRootFromParentResult(result.parentResult);
  }
  return result;
}

function createCollectionFromResult(
  relevantResult: ResultWithFolding,
  fields: FoldingFields,
  rootResult?: ResultWithFolding
): FoldedCollection {
  const resultsInCollection = getAllIncludedResultsFrom(relevantResult);

  const resultToUseAsRoot =
    rootResult ??
    resolveRootFromFields(resultsInCollection, fields) ??
    resolveRootFromParentResult(relevantResult);

  return {
    result: resultToUseAsRoot,
    children: resolveChildrenFromFields(
      resultToUseAsRoot,
      resultsInCollection,
      fields
    ),
    moreResultsAvailable: true,
    isLoadingMoreResults: false,
  };
}

function createCollections(
  results: ResultWithFolding[],
  fields: FoldingFields,
  rootResult?: ResultWithFolding
) {
  const collections: Record<CollectionId, FoldedCollection> = {};
  results.forEach((result) => {
    const collectionId = getCollectionField(result, fields);
    if (!collectionId) {
      return;
    }
    if (!getChildField(result, fields) && !result.parentResult) {
      return;
    }
    collections[collectionId] = createCollectionFromResult(
      result,
      fields,
      rootResult
    );
  });
  return collections;
}

function tryGetCollectionFromStateOrThrow(
  state: FoldingState,
  collectionId: string
) {
  if (!state.collections[collectionId]) {
    throw new Error(
      `Missing collection ${collectionId} from ${Object.keys(
        state.collections
      )}: Folding most probably in an invalid state...`
    );
  }

  return state.collections[collectionId];
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
      .addCase(fetchPage.fulfilled, (state, {payload}) => {
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
        tryGetCollectionFromStateOrThrow(
          state,
          collectionId
        ).isLoadingMoreResults = true;
      })
      .addCase(loadCollection.rejected, (state, {meta}) => {
        const collectionId = meta.arg;
        tryGetCollectionFromStateOrThrow(
          state,
          collectionId
        ).isLoadingMoreResults = false;
      })
      .addCase(
        loadCollection.fulfilled,
        (state, {payload: {collectionId, results, rootResult}}) => {
          const newCollections = createCollections(
            results as ResultWithFolding[],
            state.fields,
            rootResult
          );
          if (!newCollections || !newCollections[collectionId]) {
            throw new Error(
              `Unable to create collection ${collectionId} from received results: ${JSON.stringify(
                results
              )}. Folding most probably in an invalid state... `
            );
          }
          state.collections[collectionId] = newCollections[collectionId];
          state.collections[collectionId].moreResultsAvailable = false;
        }
      )
);
