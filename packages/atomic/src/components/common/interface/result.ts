import {FoldedResult, Result} from '@coveo/headless';

export type AnyResult = Result | FoldedResult;

export function extractUnfoldedResult(anyResult: AnyResult) {
  return (anyResult as FoldedResult).result || anyResult;
}
