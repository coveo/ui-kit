import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceSearchSection} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {buildController} from '../../../controller/headless-controller';
import {
  SearchStatus,
  SearchStatusState,
} from '../../search-status/headless-search-status';

export type {SearchStatus, SearchStatusState};

/**
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 *
 * @internal
 * */
export function buildCoreStatus(engine: CommerceEngine): SearchStatus {
  if (!loadSearchStateReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine[stateKey];

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        hasError: state.commerceSearch.error !== null,
        isLoading: state.commerceSearch.isLoading,
        hasResults: !!state.commerceSearch.products.length,
        // firstSearchExecuted: firstSearchExecutedSelector(state),
        firstSearchExecuted: true, // TODO: find a way to determine if first search has been executed
      };
    },
  };
}

function loadSearchStateReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceSearchSection> {
  engine.addReducers({commerceSearch});
  return true;
}
