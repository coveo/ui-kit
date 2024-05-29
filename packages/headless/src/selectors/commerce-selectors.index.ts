import {CommerceEngine} from '../app/commerce-engine/commerce-engine';
import {stateKey} from '../app/state-key';
import * as PLSelectors from '../features/commerce/product-listing/product-listing-selectors';
import * as SearchSelectors from '../features/commerce/search/search-selectors';

export namespace Search {
  export const responseIdSelector = wrapWithAccessFromEngine(
    SearchSelectors.responseIdSelector
  );
}

export namespace ProductListing {
  export const responseIdSelector = wrapWithAccessFromEngine(
    PLSelectors.responseIdSelector
  );
}

function wrapWithAccessFromEngine<
  SelectorFunction extends (
    state: CommerceEngine[typeof stateKey]
  ) => ReturnType<SelectorFunction>,
>(
  selector: SelectorFunction
): (engine: CommerceEngine) => ReturnType<SelectorFunction> {
  return (engine: CommerceEngine) => selector(engine[stateKey]);
}
