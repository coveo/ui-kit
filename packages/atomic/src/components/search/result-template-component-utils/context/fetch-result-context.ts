import type {FoldedResult, Result} from '@coveo/headless';
import {fetchItemContext} from '@/src/components/common/item-list/fetch-item-context';

/**
 * Retrieves `Result` on a rendered `atomic-result`.
 *
 * @param element - The element that the event is dispatched to
 * @returns A promise that resolves on initialization of the parent `atomic-result` element, or rejects if missing
 */
export function fetchResultContext<T extends Result | FoldedResult = Result>(
  element: Element
) {
  return fetchItemContext<T>(element, 'atomic-result');
}
