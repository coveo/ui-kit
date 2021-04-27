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

interface ResultWithFolding extends Result {
  parentResult?: ResultWithFolding;
  childResults?: ResultWithFolding[];
}

function getRawValue(result: ResultWithFolding, field: string) {
  const rawValue = result.raw[field] as string | [string] | undefined;
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
  const sourceChildValue = getRawValue(source, fields.child);
  return {
    ...source,
    children: sourceChildValue
      ? results
          .filter(
            (result) =>
              getRawValue(result, fields.child) !==
                getRawValue(source, fields.child) &&
              getRawValue(result, fields.parent) === sourceChildValue
          )
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
    flattenedResults.find(
      (result) =>
        getRawValue(result, fields.parent) === undefined ||
        areDefinedAndEqual(
          getRawValue(result, fields.parent),
          getRawValue(result, fields.child)
        )
    ) ?? relevantResult;

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
          ? createCollections(payload.response.results, state.fields)
          : [];
      })
      .addCase(fetchMoreResults.fulfilled, (state, {payload}) => {
        state.collections = state.enabled
          ? [
              ...state.collections,
              ...createCollections(payload.response.results, state.fields),
            ]
          : [];
      })
      .addCase(registerFolding, (state, {payload}) => ({
        enabled: true,
        collections: [],
        fields: {
          collection: payload.collectionField ?? state.fields.collection,
          parent: payload.parentField ?? state.fields.parent,
          child: payload.childField ?? state.fields.child,
        },
        maximumFoldedResults:
          payload.maximumFoldedResults ?? state.maximumFoldedResults,
      }))
);
