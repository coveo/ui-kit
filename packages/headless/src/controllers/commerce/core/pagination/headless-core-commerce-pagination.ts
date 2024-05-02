import {NumberValue, Schema} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {
  nextPage,
  previousPage,
  registerRecommendationsSlotPagination,
  selectPage,
  setPageSize,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {loadReducerError} from '../../../../utils/errors';
import {validateOptions} from '../../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {FetchResultsActionCreator} from '../common';

/**
 * The `Pagination` controller is responsible for navigating between pages of results in a commerce interface.
 */
export interface Pagination extends Controller {
  /**
   * Navigates to a specific page.
   *
   * @param page - The page to navigate to.
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
   * Sets the page size.
   *
   * @param pageSize - The page size.
   */
  setPageSize(pageSize: number): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Pagination` controller.
   */
  state: PaginationState;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CorePaginationOptions {
  slotId?: string;
  /**
   * The number of products to fetch per page.
   */
  pageSize?: number;
}

export interface CorePaginationProps {
  fetchResultsActionCreator: FetchResultsActionCreator;
  options?: CorePaginationOptions;
}

export type PaginationOptions = Omit<CorePaginationOptions, 'slotId'>;

export interface PaginationProps {
  options?: PaginationOptions;
}

const optionsSchema = new Schema({
  pageSize: new NumberValue({min: 1, max: 1000, required: false}),
});

/**
 * @internal
 * Creates a `Pagination` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Pagination` controller properties.
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

  validateOptions(engine, optionsSchema, props.options, 'buildCorePagination');

  const slotId = props.options?.slotId;

  if (props.options?.pageSize) {
    dispatch(
      setPageSize({
        slotId,
        pageSize: props.options.pageSize,
      })
    );
  }

  if (slotId) {
    dispatch(registerRecommendationsSlotPagination({slotId}));
  }

  const paginationSelector = createSelector(
    (state: CommerceEngineState) =>
      slotId
        ? state.commercePagination.recommendations[slotId]!
        : state.commercePagination.principal,
    ({perPage, ...rest}) => ({
      pageSize: perPage ?? 0,
      ...rest,
    })
  );

  return {
    ...controller,

    get state() {
      return paginationSelector(engine.state);
    },

    selectPage(page: number) {
      dispatch(
        selectPage({
          slotId,
          page,
        })
      );
      dispatch(props.fetchResultsActionCreator());
    },

    nextPage() {
      dispatch(nextPage({slotId}));
      dispatch(props.fetchResultsActionCreator());
    },

    previousPage() {
      dispatch(previousPage({slotId}));
      dispatch(props.fetchResultsActionCreator());
    },

    setPageSize(pageSize: number) {
      dispatch(setPageSize({slotId, pageSize}));
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
