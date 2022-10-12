import {FoldedResult, InteractiveResult, Result} from '@coveo/headless';
import {InsightResult} from '../../insight';

export type AnyResult = FoldedResult | AnyUnfoldedResult;
export type AnyUnfoldedResult = Result | InsightResult;

export function extractUnfoldedResult(anyResult: AnyResult): AnyUnfoldedResult {
  return (anyResult as FoldedResult).result || anyResult;
}

export type AnyInteractiveResult = InteractiveResult;
