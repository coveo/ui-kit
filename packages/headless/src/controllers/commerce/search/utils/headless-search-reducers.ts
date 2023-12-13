import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceSearchSection} from '../../../../state/state-sections';

export function loadSearchReducer(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceSearchSection> {
  engine.addReducers({commerceSearch});
  return true;
}
