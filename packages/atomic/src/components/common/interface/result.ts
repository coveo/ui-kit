import {FoldedResult, Result} from '@coveo/headless';

export type AnyResult = Result | FoldedResult;

export function extractFoldedResult(anyResult: AnyResult) {
  return (anyResult as FoldedResult).result || anyResult;
}
