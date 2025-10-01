import type {FoldedResult, InteractiveResult, Result} from '@coveo/headless';
import type {LitElement} from 'lit';
import type {InteractiveItemContextEvent} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {
  ItemContextController,
  type ItemContextEvent,
} from '@/src/components/common/item-list/context/item-context-controller';

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

export type ResultContextEvent<T = Result | FoldedResult> = ItemContextEvent<T>;
export type InteractiveResultContextEvent<
  T extends InteractiveResult = InteractiveResult,
> = InteractiveItemContextEvent<T>;
