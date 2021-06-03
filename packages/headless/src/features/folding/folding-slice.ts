import {createReducer} from '@reduxjs/toolkit';
import {Result} from '../../api/search/search/result';
import {isArray, removeDuplicates} from '../../utils/utils';
import {executeSearch, fetchMoreResults} from '../search/search-actions';
import {registerFolding} from './folding-actions';
import {
  FoldedResult,
  FoldingFields,
  getFoldingInitialState,
} from './folding-state';

export interface ResultWithFolding extends Result {
  parentResult: ResultWithFolding | null;
  childResults: ResultWithFolding[];
}

function getParentField(result: ResultWithFolding, fields: FoldingFields) {
  return result.raw[fields.parent];
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

function flattenResultTree(result: ResultWithFolding): ResultWithFolding[] {
  const results = [result];
  if (result.parentResult) {
    results.unshift(result.parentResult);
  }
  if (result.childResults?.length) {
    results.push(
      ...result.childResults.flatMap((childResult) =>
        flattenResultTree(childResult)
      )
    );
  }
  return results;
}

function foldResult(
  source: ResultWithFolding,
  results: ResultWithFolding[],
  fields: FoldingFields
): FoldedResult {
  const sourceChildValue = getChildField(source, fields);
  return {
    ...source,
    children: sourceChildValue
      ? results
          .filter((result) => {
            const isSameResultAsSource =
              getChildField(result, fields) === getChildField(source, fields);
            const isChildOfSource =
              getParentField(result, fields) === sourceChildValue;
            return isChildOfSource && !isSameResultAsSource;
          })
          .map((result) => foldResult(result, results, fields))
      : [],
  };
}

function createCollection(
  relevantResult: ResultWithFolding,
  fields: FoldingFields
): FoldedResult {
  const flattenedResults = removeDuplicates(
    flattenResultTree(relevantResult),
    (result) => result.uniqueId
  );

  const topLevelResult =
    flattenedResults.find((result) => {
      const hasNoParent = getParentField(result, fields) === undefined;
      const isParentOfItself = areDefinedAndEqual(
        getParentField(result, fields),
        getChildField(result, fields)
      );
      return hasNoParent || isParentOfItself;
    }) ?? relevantResult;

  return foldResult(topLevelResult, flattenedResults, fields);
}

function createCollections(
  results: ResultWithFolding[],
  fields: FoldingFields
): FoldedResult[] {
  return results.map((result) => createCollection(result, fields));
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
          : [];
      })
      .addCase(fetchMoreResults.fulfilled, (state, {payload}) => {
        state.collections = state.enabled
          ? [
              ...state.collections,
              ...createCollections(
                payload.response.results as ResultWithFolding[],
                state.fields
              ),
            ]
          : [];
      })
      .addCase(registerFolding, (state, {payload}) =>
        state.enabled
          ? state
          : {
              enabled: true,
              collections: [],
              fields: {
                collection: payload.collectionField ?? state.fields.collection,
                parent: payload.parentField ?? state.fields.parent,
                child: payload.childField ?? state.fields.child,
              },
              numberOfFoldedResults:
                payload.numberOfFoldedResults ?? state.numberOfFoldedResults,
            }
      )
);
