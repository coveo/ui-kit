import type {FoldedResult, Result} from '@coveo/headless';
import type {Product} from '@coveo/headless/commerce';
import type {Result as InsightResult} from '@coveo/headless/insight';

export type AnyItem = FoldedResult | AnyUnfoldedItem | Product;
export type AnyUnfoldedItem = Result | InsightResult;

export function extractUnfoldedItem(anyResult: AnyItem): AnyUnfoldedItem {
  return (anyResult as FoldedResult).result || anyResult;
}
