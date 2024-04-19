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
  facet?: AnyFacetType,
  bindings: AnyBindings
): boolean {
  if (tabs !== '' && facet) {
    if (shouldDisplayOnCurrentTab(tabs, bindings.engine.state)) {
      enableFacet(facet);
      return true;
    } else {
      disableFacet(facet);
      return false;
    }
  }
  return true;
}

function disableFacet(facet: AnyFacetType) {
  facet.state.enabled = false;
  facet.disable();
}

function enableFacet(facet: AnyFacetType) {
  facet.state.enabled = true;
  facet.enable();
}
