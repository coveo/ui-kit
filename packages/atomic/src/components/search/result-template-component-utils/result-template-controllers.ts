import type {FoldedResult, InteractiveResult, Result} from '@coveo/headless';
import type {LitElement} from 'lit';
import {
  InteractiveItemContextController,
  type InteractiveItemContextEvent,
} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {
  ItemContextController,
  type ItemContextEvent,
} from '@/src/components/common/item-list/context/item-context-controller';
import {fetchItemContext} from '@/src/components/common/item-list/fetch-item-context';

/**
 * Creates a [Lit reactive controller](https://lit.dev/docs/composition/controllers/) for managing result context in result template components.
 *
 * @param host - The Lit component instance
 * @param options - Configuration options
 * @returns ItemContextController instance configured for atomic-result
 */
export function createResultContextController(
  host: LitElement & {error: Error | null},
  options: {folded?: boolean} = {}
): ItemContextController<Result | FoldedResult> {
  return new ItemContextController<Result | FoldedResult>(host, {
    parentName: 'atomic-result',
    folded: options.folded ?? false,
  });
}

/**
 * Creates a [Lit reactive controller](https://lit.dev/docs/composition/controllers/) for managing interactive result context in result template components.
 *
 * @param host - The Lit component instance
 * @returns InteractiveItemContextController instance
 */
export function createInteractiveResultContextController(
  host: LitElement & {error: Error}
): InteractiveItemContextController<InteractiveResult> {
  return new InteractiveItemContextController<InteractiveResult>(host);
}

export type ResultContextEvent<T = Result> = ItemContextEvent<T>;
export type InteractiveResultContextEvent<
  T extends InteractiveResult = InteractiveResult,
> = InteractiveItemContextEvent<T>;

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
