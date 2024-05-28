import {CommerceEngine} from '../app/commerce-engine/commerce-engine';
import {stateKey} from '../app/state-key';
import * as PLSelectors from '../features/commerce/product-listing/product-listing-selectors';
import * as SearchSelectors from '../features/commerce/search/search-selectors';

export namespace Search {
  export const responseIdSelector = wrap(SearchSelectors.responseIdSelector);
}

export namespace ProductListing {
  export const responseIdSelector = wrap(PLSelectors.responseIdSelector);
}

function wrap<
  SelectorFunction extends (
    state: CommerceEngine[typeof stateKey]
  ) => ReturnType<SelectorFunction>,
>(
  selector: SelectorFunction
): (engine: CommerceEngine) => ReturnType<SelectorFunction> {
  return (engine: CommerceEngine) => selector(engine[stateKey]);
}
