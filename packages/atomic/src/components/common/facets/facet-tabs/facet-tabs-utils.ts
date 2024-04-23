import {CategoryFacet, DateFacet, Facet, NumericFacet} from '@coveo/headless';
import {shouldDisplayOnCurrentTab} from '../../../../utils/tab-utils';
import {AnyBindings} from '../../interface/bindings';

type AnyFacetType = Facet | NumericFacet | CategoryFacet | DateFacet;

/**
 * Updates the visibility of a facet based on the active tab.
 * @param tabs - The active tab.
 * @param facet - The facet to update.
 * @param bindings - The bindings object.
 * @returns A boolean indicating whether the facet was enabled or disabled.
 */
export function updateFacetVisibilityForActiveTab(
  tabs: string,
  bindings: AnyBindings,
  facet?: AnyFacetType
): boolean {
  if (tabs === '') {
    return true;
  }
  if (!facet) {
    return true;
  }
  if (shouldDisplayOnCurrentTab(tabs, bindings.engine.state)) {
    facet.enable();
    return true;
  } else {
    facet.disable();
    return false;
  }
  
}
