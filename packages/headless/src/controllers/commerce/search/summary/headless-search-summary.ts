import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  querySelector,
  responseIdSelector,
} from '../../../../features/commerce/search/search-selectors';
import {loadReducerError} from '../../../../utils/errors';
import {
  Summary,
  SummaryState,
  buildCoreSummary,
} from '../../core/summary/headless-core-summary';
import {loadSearchReducer} from '../utils/load-search-reducers';

export interface SearchSummaryState extends SummaryState {
  /**
   * The search query.
   */
  query: string;
}

export interface SearchSummary extends Summary {
  /**
   * A scoped and simplified part of the headless state that is relevant to the `SearchSummary` controller.
   */
  state: SearchSummaryState;
}

/**
 * Builds a `SearchSummary` controller.
 * @param engine
 * @returns
 */
export const buildSearchSummary = (engine: CommerceEngine) => {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildCoreSummary(engine, {
    options: {
      selectNumProducts: numberOfProductsSelector,
      selectResponseId: responseIdSelector,
      selectLoading: isLoadingSelector,
      selectError: errorSelector,
    },
  });

  return {
    ...controller,
    get state(): SearchSummaryState {
      return {
        ...controller.state,
        query: querySelector(engine[stateKey]) || '',
      };
    },
  };
};
