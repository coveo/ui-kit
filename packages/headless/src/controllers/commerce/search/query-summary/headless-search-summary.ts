import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {commerceSearchReducer} from '../../../../features/commerce/search/search-slice';
import {CommerceSearchSection} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {buildController} from '../../../controller/headless-controller';

export const buildSearchSummary = (engine: CommerceEngine) => {
  if (!loadQuerySummaryReducers(engine)) {
    throw loadReducerError;
  }
  const controller = buildController(engine);

  //const firstResult = engine.state.commercePagination.principal.page
  //firstResult: getState().pagination.firstResult + 1,

  return {
    ...controller,
  };
};

function loadQuerySummaryReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceSearchSection> {
  engine.addReducers({search: commerceSearchReducer});
  return true;
}
