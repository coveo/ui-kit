import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice.js';
import {CommerceSearchSection} from '../../../../state/state-sections.js';

export function loadSearchReducer(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceSearchSection> {
  engine.addReducers({commerceSearch});
  return true;
}
