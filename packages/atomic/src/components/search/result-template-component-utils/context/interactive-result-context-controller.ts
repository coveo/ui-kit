import type {InteractiveResult} from '@coveo/headless';
import type {LitElementWithError} from '@/src/decorators/types';
import {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';

/**
 * Creates a [Lit reactive controller](https://lit.dev/docs/composition/controllers/) for managing interactive result context in result template components.
 *
 * @param host - The Lit component instance
 * @returns InteractiveItemContextController instance
 */
export function createInteractiveResultContextController(
  host: LitElementWithError
): InteractiveItemContextController<InteractiveResult> {
  return new InteractiveItemContextController<InteractiveResult>(host);
}
