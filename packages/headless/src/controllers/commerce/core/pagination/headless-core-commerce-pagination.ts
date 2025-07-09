import {NumberValue, Schema} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {
  nextPage,
  previousPage,
  registerRecommendationsSlotPagination,
  selectPage,
  setPageSize,
} from '../../../../features/commerce/pagination/pagination-actions.js';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {validateOptions} from '../../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../../controller/headless-controller.js';
import type {FetchProductsActionCreator} from '../common.js';

/**
 * The `Pagination` sub-controller is responsible for navigating between pages of results in a commerce interface.
 *
 * @group Sub-controllers
 * @category Pagination
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
   * Fetches the next page of products, and appends them to the current list of products.
   */
  fetchMoreProducts(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Pagination` sub-controller.
   */
  state: PaginationState;
}

/**
 * @group Sub-controllers
 * @category Pagination
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalEntries: number;
  totalPages: number;
}

export interface CorePaginationOptions {
  /**
   * For internal use by Headless.
   */
  slotId?: string;
  /**
   * The number of products to fetch per page.
   */
  pageSize?: number;
}

export interface CorePaginationProps {
  fetchProductsActionCreator: FetchProductsActionCreator;
  fetchMoreProductsActionCreator: FetchProductsActionCreator;
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
 * Creates a `Pagination` sub-controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Pagination` sub-controller properties.
 * @returns A `Pagination` sub-controller instance.
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
      return paginationSelector(engine[stateKey]);
    },

    selectPage(page: number) {
      dispatch(
        selectPage({
          slotId,
          page,
        })
      );
      dispatch(props.fetchProductsActionCreator());
    },

    nextPage() {
      dispatch(nextPage({slotId}));
      dispatch(props.fetchProductsActionCreator());
    },

    previousPage() {
      dispatch(previousPage({slotId}));
      dispatch(props.fetchProductsActionCreator());
    },

    setPageSize(pageSize: number) {
      dispatch(setPageSize({slotId, pageSize}));
      dispatch(props.fetchProductsActionCreator());
    },

    fetchMoreProducts() {
      dispatch(props.fetchMoreProductsActionCreator());
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
