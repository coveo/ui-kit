import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  RegisterRecommendationsSlotPaginationPayload,
  NextPagePayload,
  PreviousPagePayload,
  SelectPagePayload,
  SetPageSizePayload,
  previousPage,
  nextPage,
  selectPage,
  setPageSize,
  registerRecommendationsSlotPagination,
} from './pagination-actions.js';
import {paginationReducer as commercePagination} from './pagination-slice.js';

export type {
  RegisterRecommendationsSlotPaginationPayload,
  SetPageSizePayload,
  SelectPagePayload,
  NextPagePayload,
  PreviousPagePayload,
};

/**
 * The pagination action creators.
 */
export interface PaginationActionCreators {
  /**
   * Registers pagination for a recommendations slot.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerRecommendationsSlotPagination(
    payload: RegisterRecommendationsSlotPaginationPayload
  ): PayloadAction<RegisterRecommendationsSlotPaginationPayload>;

  /**
   * Sets the page size.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setPageSize(payload: SetPageSizePayload): PayloadAction<SetPageSizePayload>;

  /**
   * Selects a page.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  selectPage(payload: SelectPagePayload): PayloadAction<SelectPagePayload>;

  /**
   * Selects the next page.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  nextPage(
    payload?: NextPagePayload
  ): PayloadAction<NextPagePayload | undefined>;

  /**
   * Selects the previous page.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  previousPage(
    payload?: PreviousPagePayload
  ): PayloadAction<PreviousPagePayload | undefined>;
}

/**
 * Loads the commerce pagination reducer and returns the available pagination action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the pagination action creators.
 */
export function loadPaginationActions(
  engine: CommerceEngine
): PaginationActionCreators {
  engine.addReducers({commercePagination});
  return {
    registerRecommendationsSlotPagination,
    setPageSize,
    selectPage,
    nextPage,
    previousPage,
  };
}
