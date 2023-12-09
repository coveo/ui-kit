import {AsyncThunkAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  nextPage,
  selectPage,
  previousPage,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {loadReducerError} from '../../../../utils/errors';
import {
  Controller,
  buildController,
} from '../../../controller/headless-controller';

/**
 * The `Pagination` controller is responsible for navigating between pages of results in a commerce interface.
 */
export interface Pagination extends Controller {
  /**
   * Navigates to a specific page.
   *
   * @param page The page to navigate to.
   */
  selectPage(page: number): void;

  /**
   * Navigates to the next page.
   */
  nextPage(): void;

  /**
   * Navigates to the previous page.
   */
  previousPage(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Pagination` controller.
   */
  state: PaginationState;
}

export interface PaginationState {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export type PaginationControllerState = Pagination['state'];

export interface CorePaginationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchResultsActionCreator: () => AsyncThunkAction<unknown, void, any>;
}

/**
 * @internal
 * Creates a `Pagination` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `Pagination` controller instance.
 * */
export function buildCorePagination(
  engine: CommerceEngine,
  props: CorePaginationProps
): Pagination {
  if (!loadPaginationReducers(engine)) {
    throw loadReducerError;
  }
  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => {
    return engine.state.commercePagination;
  };

  return {
    ...controller,

    get state() {
      return getState();
    },

    selectPage(page: number) {
      dispatch(selectPage(page));
      dispatch(props.fetchResultsActionCreator());
    },

    nextPage() {
      dispatch(nextPage());
      dispatch(props.fetchResultsActionCreator());
    },

    previousPage() {
      dispatch(previousPage());
      dispatch(props.fetchResultsActionCreator());
    },
  };
}

function loadPaginationReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({
    commercePagination,
  });
  return true;
}
