import {createReducer} from '@reduxjs/toolkit';
import type {Result} from '../../api/search/search/result.js';
import {isArray} from '../../utils/utils.js';
import {
  executeSearch,
  fetchMoreResults,
  fetchPage,
} from '../search/search-actions.js';
import {loadCollection, registerFolding} from './folding-actions.js';
import {
  type CollectionId,
  type FoldedCollection,
  type FoldedResult,
  type FoldingFields,
  type FoldingState,
  getFoldingInitialState,
} from './folding-state.js';
import {getAllIncludedResultsFrom} from './folding-utils.js';

export interface ResultWithFolding extends Result {
  parentResult: ResultWithFolding | null;
  childResults: ResultWithFolding[];
  totalNumberOfChildResults: number;
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
    .map((result) => {
      const extendedResult = {...result, searchUid: parent.searchUid};
      return {
        result: extendedResult,
        children: resolveChildrenFromFields(extendedResult, results, fields, [
          ...resolvedAncestors,
          sourceChildValue,
        ]),
      };
    });
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
  searchUid: string,
  rootResult?: ResultWithFolding
): FoldedCollection {
  const resultsInCollection = getAllIncludedResultsFrom(relevantResult);

  const resultToUseAsRoot =
    rootResult ??
    resolveRootFromFields(resultsInCollection, fields) ??
    resolveRootFromParentResult(relevantResult);

  const extendedResultToUseAsRoot = {...resultToUseAsRoot, searchUid};

  return {
    result: extendedResultToUseAsRoot,
    children: resolveChildrenFromFields(
      extendedResultToUseAsRoot,
      resultsInCollection,
      fields
    ),
    // To understand why "1" instead of "0", see here : https://coveord.atlassian.net/browse/SEARCHAPI-11075. totalNumberOfChildResults is off by 1 by the index design.
    moreResultsAvailable: relevantResult.totalNumberOfChildResults > 1,
    isLoadingMoreResults: false,
  };
}

function createCollections(
  results: ResultWithFolding[],
  fields: FoldingFields,
  searchUid: string,
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
      searchUid,
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
              state.fields,
              payload.response.searchUid
            )
          : {};
      })
      .addCase(fetchPage.fulfilled, (state, {payload}) => {
        state.collections = state.enabled
          ? createCollections(
              payload.response.results as ResultWithFolding[],
              state.fields,
              payload.response.searchUid
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
                payload.response.searchUid
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
        (state, {payload: {collectionId, results, rootResult, searchUid}}) => {
          const newCollections = createCollections(
            results as ResultWithFolding[],
            state.fields,
            searchUid,
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
